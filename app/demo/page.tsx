import { redirect } from "next/navigation"

export default function DemoPage() {
  // In a real implementation, you would set up demo data here
  // For now, we'll just redirect to the comparison page
  redirect("/comparison")
}
