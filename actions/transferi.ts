"use server"

import { revalidatePath } from "next/cache"

import { prisma } from "@/lib/prisma"
import {
  combineDateAndTimeUtc,
  type TransferRecord,
  getOptionalNumber,
  getOptionalString,
  getRequiredString,
  parseDateOnly,
  parseRelacija,
  parseTimeOnly,
} from "@/actions/transfer-utils"

export async function getTransferi(): Promise<TransferRecord[]> {
  return prisma.transfer.findMany({
    orderBy: [{ datum: "desc" }, { vrijeme: "desc" }, { id: "desc" }],
  })
}

export async function getTransferById(
  formData: FormData
): Promise<TransferRecord | null> {
  const id = getRequiredString(formData, "id")

  return prisma.transfer.findUnique({ where: { id } })
}

export async function createTransfer(formData: FormData): Promise<TransferRecord> {
  const relacija = parseRelacija(getRequiredString(formData, "relacija"))
  const datum = parseDateOnly(getRequiredString(formData, "datum"))
  const vrijeme = parseTimeOnly(getRequiredString(formData, "vrijeme"))
  const datumVrijemeUtc = combineDateAndTimeUtc(datum, vrijeme)
  const alarmEnabled = formData.get("alarmEnabled") === "on"

  const transfer = await prisma.transfer.create({
    data: {
      relacija,
      ostaleRelacije: getOptionalString(formData, "ostaleRelacije"),
      iznos: getOptionalNumber(formData, "iznos"),
      datum,
      vrijeme,
      datumVrijemeUtc,
      alarmEnabled,
      korisnik: getOptionalString(formData, "korisnik"),
    },
  })

  revalidatePath("/transferi")
  revalidatePath("/")
  revalidatePath("/transferi/dodaj")

  return transfer
}

export async function updateTransfer(formData: FormData): Promise<TransferRecord> {
  const id = getRequiredString(formData, "id")

  const rawRelacija = formData.get("relacija")
  const rawDatum = formData.get("datum")
  const rawVrijeme = formData.get("vrijeme")
  const alarmEnabled = formData.get("alarmEnabled") === "on"

  const current = await prisma.transfer.findUnique({ where: { id } })

  if (!current) {
    throw new Error("Transfer nije pronađen.")
  }

  const nextDatum =
    typeof rawDatum === "string" && rawDatum.trim()
      ? parseDateOnly(rawDatum.trim())
      : current.datum
  const nextVrijeme =
    typeof rawVrijeme === "string" && rawVrijeme.trim()
      ? parseTimeOnly(rawVrijeme.trim())
      : current.vrijeme

  const datumVrijemeUtc = combineDateAndTimeUtc(nextDatum, nextVrijeme)

  const shouldResetAlarmSentAt =
    current.datumVrijemeUtc.getTime() !== datumVrijemeUtc.getTime() ||
    current.alarmEnabled !== alarmEnabled

  const transfer = await prisma.transfer.update({
    where: { id },
    data: {
      relacija:
        typeof rawRelacija === "string" && rawRelacija.trim()
          ? parseRelacija(rawRelacija.trim())
          : undefined,
      ostaleRelacije: formData.has("ostaleRelacije")
        ? getOptionalString(formData, "ostaleRelacije")
        : undefined,
      iznos: getOptionalNumber(formData, "iznos"),
      datum: nextDatum,
      vrijeme: nextVrijeme,
      datumVrijemeUtc,
      alarmEnabled,
      alarmSentAt: shouldResetAlarmSentAt ? null : undefined,
      korisnik: formData.has("korisnik")
        ? getOptionalString(formData, "korisnik")
        : undefined,
    },
  })

  revalidatePath("/transferi")
  revalidatePath("/")
  revalidatePath("/transferi/arhiva")

  return transfer
}

export async function deleteTransfer(formData: FormData): Promise<TransferRecord> {
  const id = getRequiredString(formData, "id")

  const transfer = await prisma.$transaction(async (tx) => {
    const deleted = await tx.transfer.delete({ where: { id } })

    await tx.arhivaTransfera.create({
      data: {
        id: deleted.id,
        relacija: deleted.relacija,
        ostaleRelacije: deleted.ostaleRelacije,
        iznos: deleted.iznos,
        datum: deleted.datum,
        vrijeme: deleted.vrijeme,
        datumVrijemeUtc: deleted.datumVrijemeUtc,
        alarmEnabled: deleted.alarmEnabled,
        alarmSentAt: deleted.alarmSentAt,
        korisnik: deleted.korisnik,
      },
    })

    return deleted
  })

  revalidatePath("/transferi")
  revalidatePath("/")
  revalidatePath("/transferi/arhiva")

  return transfer
}
