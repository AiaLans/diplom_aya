'use client'

export default function PrintResumeButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 flex items-center gap-2"
    >
      📥 Скачать PDF
    </button>
  )
}