const CHIPS = [
  "What does the founder memo not say that it should?",
  "Which GTM motion gives the best shot at 100 families in 6 months?",
  "What is the most likely way this fails?",
  "Is the competitive window real or a narrative device?",
  "What should I know before joining without a salary?",
  "What would need to be true for the seed round to close on time?",
]

export default function SuggestionChips({ onSelect }) {
  return (
    <div className="chips">
      {CHIPS.map(chip => (
        <button key={chip} className="chip" onClick={() => onSelect(chip)}>
          {chip}
        </button>
      ))}
    </div>
  )
}
