import { Droplet } from "lucide-react"

export function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col justify-center items-center h-[60vh]">
          <div className="animate-pulse">
            <Droplet className="w-12 h-12 text-red-500 dark:text-red-400" />
          </div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Yükleniyor...</p>
        </div>
      </div>
    </div>
  )
} 