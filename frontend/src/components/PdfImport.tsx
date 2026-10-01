import { useState, type ChangeEvent } from 'react'
import type { MessageState } from '../types/candidate'

type PdfImportProps = {
  onImport: (file: File) => Promise<void>
  isImporting: boolean
  message: MessageState | null
  warnings: string[]
}

function PdfImport({
  onImport,
  isImporting,
  message,
  warnings,
}: PdfImportProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    setSelectedFile(event.target.files?.[0] ?? null)
  }

  async function handleImport() {
    if (!selectedFile) {
      return
    }

    await onImport(selectedFile)
  }

  return (
    <div className="pdf-upload">
      <label htmlFor="pdf-file">Currículo em PDF</label>

      <input
        id="pdf-file"
        name="file"
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
      />

      <button
        type="button"
        onClick={handleImport}
        disabled={isImporting || !selectedFile}
      >
        {isImporting ? 'Importando PDF...' : 'Importar currículo em PDF'}
      </button>

      {message && (
        <p className={`feedback-message ${message.type}`} role="status">
          {message.text}
        </p>
      )}

      {warnings.length > 0 && (
        <ul className="warning-list">
          {warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default PdfImport