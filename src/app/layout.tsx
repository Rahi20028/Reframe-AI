import './globals.css'

export const metadata = {
  title: 'Reframe-AI',
  description: 'A CBT-based mental wellness companion',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  )
}