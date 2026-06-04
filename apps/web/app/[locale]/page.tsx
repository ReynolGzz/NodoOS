import { redirect } from 'next/navigation'

// Root page — there's no home yet, redirect to a placeholder
export default function HomePage() {
  redirect('/') // Will be replaced with a landing page
}
