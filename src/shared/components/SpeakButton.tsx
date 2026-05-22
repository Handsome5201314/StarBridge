import { Volume2 } from 'lucide-react'
import { speak } from '../utils/speech'

type SpeakButtonProps = {
  text: string
  label?: string
}

export function SpeakButton({ text, label = '朗读' }: SpeakButtonProps) {
  return (
    <button
      className="speak-button"
      type="button"
      aria-label={`${label}：${text}`}
      onClick={() => speak(text)}
    >
      <Volume2 size={20} aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}
