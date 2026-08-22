import Link from "next/link"

export function Logo() {
  return (
    <Link href="/" className="text-xl font-bold text-accent dark:text-white">
      Ge<span className="text-primary-300">MUN</span>i
    </Link>
  )
}