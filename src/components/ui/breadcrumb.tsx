import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  title: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {items.map((item, index) => {
        const isLast = index === items.length - 1
        
        return (
          <div key={item.title} className="flex items-center">
            {item.href ? (
              <Link 
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.title}
              </Link>
            ) : (
              <span className="text-foreground">{item.title}</span>
            )}
            
            {!isLast && (
              <ChevronRight className="w-4 h-4 mx-2" />
            )}
          </div>
        )
      })}
    </nav>
  )
} 