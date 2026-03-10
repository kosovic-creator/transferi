"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"

import { createTransferSafe } from "@/actions/transferi"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"

function SubmitButton() {
	const { pending } = useFormStatus()

	return (
		<Button type="submit" disabled={pending} className="w-full sm:w-auto">
			{pending ? "Spremam..." : "Sačuvaj transfer"}
		</Button>
	)
}

export default function DodajTransferPage() {
	const router = useRouter()
	const [relacija, setRelacija] = useState("")
	const [datum, setDatum] = useState<Date | undefined>()
	const [isCalendarOpen, setIsCalendarOpen] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [sat, setSat] = useState("")
	const [minuta, setMinuta] = useState("")
	const [korisnik, setKorisnik] = useState("")
	const isApartmanAerodrom = relacija === "apartman-aerodrom"
	const today = useMemo(() => {
		const now = new Date()
		now.setHours(0, 0, 0, 0)
		return now
	}, [])

	const datumString = useMemo(() => {
		if (!datum) {
			return ""
		}

		return format(datum, "yyyy-MM-dd")
	}, [datum])

	const vrijemeString = useMemo(() => {
		if (!sat || !minuta) {
			return ""
		}
		return `${sat.padStart(2, "0")}:${minuta.padStart(2, "0")}`
	}, [sat, minuta])

	const sati = useMemo(() => {
		return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))
	}, [])

	const minute = useMemo(() => {
		return Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, "0"))
	}, [])

	return (
		<main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-10">
			<div className="mb-8 space-y-2">
				<h1 className="text-2xl font-semibold">Novi transfer</h1>
				<p className="text-sm text-muted-foreground">
					Unesi relaciju, datum, vrijeme i ostale detalje transfera.
				</p>
			</div>

			<form
				className="space-y-5 rounded-xl border bg-card p-4 sm:p-6"
				action={async (formData) => {
					setError(null)
					const result = await createTransferSafe(formData)

					if (!result.ok) {
						setError(result.error)
						toast.error(result.error)
						return
					}

					toast.success("Transfer je uspjesno dodat.")
					setRelacija("")
					setDatum(undefined)
					setSat("")
					setMinuta("")
					setKorisnik("")

					if (result.sms.status === "sent") {
						toast.success(
							`SMS zahtjev je prihvaćen za ${result.sms.to} (Twilio: ${result.sms.twilioStatus}).`
						)
					}

					if (result.sms.status === "skipped") {
						toast.error(`SMS nije poslat: ${result.sms.reason}`)
					}

					if (result.sms.status === "failed") {
						toast.error(`Transfer je sačuvan, ali SMS nije poslat: ${result.sms.error}`)
					}
					setTimeout(() => {
						router.push("/")
					}, 800)
				}}
			>
				<input type="hidden" name="relacija" value={relacija} required />
				<input type="hidden" name="datum" value={datumString} required />
				<input type="hidden" name="vrijeme" value={vrijemeString} required />

				<div className="space-y-2">
					<label className="text-sm font-medium">Relacija</label>
					<Select value={relacija} onValueChange={(value) => setRelacija(value ?? "")}>
						<SelectTrigger className="w-full">
							<SelectValue placeholder="Izaberi relaciju" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="apartman-aerodrom">
								apartman-aerodrom
							</SelectItem>
							<SelectItem value="aerodrom-apartman">
								aerodrom-apartman
							</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{!isApartmanAerodrom ? (
					<div className="space-y-2">
						<label className="text-sm font-medium">Broj leta ili odakle dolazi *</label>
						<Input
							name="brojLetaNapomena"
							placeholder="Npr. broj leta ili odakle dolazi"
							required
						/>
					</div>
				) : null}

				<div className="space-y-2">
					<label className="text-sm font-medium">Datum</label>
					<Input
						value={datum ? format(datum, "dd.MM.yyyy") : ""}
						readOnly
						placeholder="Izaberi datum"
						onClick={() => setIsCalendarOpen(true)}
						className="cursor-pointer"
					/>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Vrijeme</label>
					<div className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
						<Select value={sat} onValueChange={(value) => setSat(value ?? "")}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Sat" />
							</SelectTrigger>
							<SelectContent>
								{sati.map((h) => (
									<SelectItem key={h} value={h}>
										{h}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<span className="hidden items-center justify-center text-lg sm:flex">:</span>
						<Select value={minuta} onValueChange={(value) => setMinuta(value ?? "")}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder="Minuta" />
							</SelectTrigger>
							<SelectContent>
								{minute.map((m) => (
									<SelectItem key={m} value={m}>
										{m}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="space-y-2">
					<label className="text-sm font-medium">Iznos</label>
					<Input name="iznos" type="number" min="0" step="0.01" defaultValue="20" />
				</div>

				{!isApartmanAerodrom ? (
					<div className="space-y-2">
						<label className="text-sm font-medium">Korisnik *</label>
						<Input
							name="korisnik"
							placeholder="Ime korisnika"
							value={korisnik}
							onChange={(event) => setKorisnik(event.target.value)}
							required
						/>
					</div>
				) : null}

				{!isApartmanAerodrom ? (
					<div className="space-y-2">
						<label className="text-sm font-medium">Telefon korisnika (opciono)</label>
						<Input name="brojTelefona" placeholder="npr. +38269111222" />
					</div>
				) : null}

				{error ? <p className="text-sm text-red-600">{error}</p> : null}

				<SubmitButton />
			</form>

			<Dialog open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Izaberi datum transfera</DialogTitle>
						<DialogDescription>
							Odabrani datum će biti sačuvan u polje datum.
						</DialogDescription>
					</DialogHeader>

					<Calendar
						mode="single"
						selected={datum}
						disabled={{ before: today }}
						onSelect={(selected) => {
							setDatum(selected)
							if (selected) {
								setIsCalendarOpen(false)
							}
						}}
						className="mx-auto"
					/>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => setIsCalendarOpen(false)}>
							Zatvori
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</main>
	)
}
