const CHIPS = [
  "What is the most likely way this startup fails in the next 18 months?",
  "Is this the right team to win this specific market — and what's missing?",
  "What does this company need to prove in the next 12–18 months to raise its next round, and how realistic is that runway?",
  "Where does the company's story about its market not match reality?",
  "What would have to be true for this to be a career-defining move for me personally?",
  "What is my realistic downside if this fails in 18 months, and am I actually prepared for it?",
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
