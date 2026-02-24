import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface SearchPatientsProps {
  onSearch: (query: string) => void
}

export function SearchPatients({ onSearch }: SearchPatientsProps) {
  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Cari Pasien (Nama atau NIK)..."
        className="w-full pl-8 h-9 rounded-full bg-white shadow-sm border-emerald-100 focus-visible:ring-emerald-500"
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  )
}
