import QRCode from 'qrcode'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { supabase } from '@/lib/supabase'

type StampPdfInput = {
  sourceUrl: string
  documentId: string
  verificationUrl: string
}

function getStoragePathFromPublicUrl(url: string) {
  const marker = '/documents/'
  const index = url.indexOf(marker)
  if (index === -1) return null

  return decodeURIComponent(url.slice(index + marker.length))
}

function getStampedPath(sourceUrl: string, documentId: string) {
  const existingPath = getStoragePathFromPublicUrl(sourceUrl)
  const folder = existingPath?.includes('/')
    ? existingPath.slice(0, existingPath.lastIndexOf('/'))
    : documentId

  return `${folder}/signed_${documentId}_${Date.now()}.pdf`
}

export async function addKriptoQrToPdf({
  sourceUrl,
  documentId,
  verificationUrl,
}: StampPdfInput) {
  const sourceRes = await fetch(sourceUrl, { cache: 'no-store' })
  if (!sourceRes.ok) {
    throw new Error(`Не удалось скачать PDF для QR: ${sourceRes.status}`)
  }

  const sourceBytes = await sourceRes.arrayBuffer()
  const pdf = await PDFDocument.load(sourceBytes)
  const pages = pdf.getPages()
  const page = pages[pages.length - 1]
  const { width } = page.getSize()
  const font = await pdf.embedFont(StandardFonts.Helvetica)

  const qrPngDataUrl = await QRCode.toDataURL(verificationUrl, {
    width: 220,
    margin: 1,
    errorCorrectionLevel: 'M',
  })
  const qrPngBytes = Buffer.from(qrPngDataUrl.split(',')[1], 'base64')
  const qrImage = await pdf.embedPng(qrPngBytes)

  const qrSize = 86
  const padding = 24
  const x = width - qrSize - padding
  const y = padding + 34

  page.drawRectangle({
    x: x - 8,
    y: y - 30,
    width: qrSize + 16,
    height: qrSize + 52,
    color: rgb(1, 1, 1),
    borderColor: rgb(0.82, 0.86, 0.92),
    borderWidth: 1,
  })
  page.drawImage(qrImage, { x, y, width: qrSize, height: qrSize })
  page.drawText('Kripto verification', {
    x: x - 2,
    y: y - 12,
    size: 7,
    font,
    color: rgb(0.1, 0.16, 0.28),
  })
  page.drawText(verificationUrl, {
    x: padding,
    y: padding,
    size: 7,
    font,
    color: rgb(0.12, 0.34, 0.72),
    maxWidth: width - padding * 2,
  })

  const stampedBytes = await pdf.save()
  const stampedPath = getStampedPath(sourceUrl, documentId)

  const { error } = await supabase.storage
    .from('documents')
    .upload(stampedPath, Buffer.from(stampedBytes), {
      contentType: 'application/pdf',
      upsert: true,
    })

  if (error) throw error

  const { data } = supabase.storage.from('documents').getPublicUrl(stampedPath)
  return data.publicUrl
}
