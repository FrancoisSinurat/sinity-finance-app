import Link from "next/link";

export default function Homepage(){
  return (
    <h1>Ini halaman Utama direct ke halaman berikut untuk <Link href="/login" className="text-blue-500 text-underline">login</Link></h1>
  )
}