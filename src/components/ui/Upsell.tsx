import { Link } from 'react-router'
import { useAccount } from '../../hooks/useAccount'

/**
 * `panel` replaces a block that would otherwise be empty and carries the copy;
 * `inline` fits a slot beside other content, where a full card would shout and
 * where there is no room for a sentence. The two take different props, so the
 * shape says which is which rather than leaving an unused title behind.
 */
type UpsellProps = { className?: string } & (
  | { variant: 'inline' }
  | {
      variant?: 'panel'
      /** What is being withheld, in the reader's terms rather than the API's. */
      title: string
      /** One sentence on why it is worth having. */
      detail?: string
    }
)

/**
 * The one place that decides what a withheld thing invites you to do, because
 * the answer is not the same for everyone looking at it.
 *
 * An anonymous visitor is asked to register, not to subscribe: signing up is
 * what reveals the first prediction, and three a day are free once it does. So
 * registration is the conversion step, and sending that reader to a price list
 * would ask for money before they have seen anything work. A signed-in free
 * account has already spent those three, and for them the price list is
 * exactly the right destination.
 */
function Upsell(props: UpsellProps) {
  const { className = '' } = props
  const { isSignedIn, loading } = useAccount()

  /**
   * Which action is right depends on who is asking, so nothing is offered
   * until `/me` settles — but the slot still has to be occupied, or a locked
   * card spends the first moments of every page load looking like one that
   * failed to render. So the fact is stated immediately and only the invitation
   * waits.
   */
  const action = isSignedIn
    ? { label: 'See plans', to: '/pricing' }
    : { label: 'Sign up free', to: '/login?new=1' }

  if (props.variant === 'inline') {
    if (loading) return <p className={`eyebrow shrink-0 text-ink-subtle ${className}`}>Locked</p>

    return (
      <Link
        to={action.to}
        onClick={(event) => event.stopPropagation()}
        className={`eyebrow shrink-0 rounded-md border border-primary/40 bg-primary/10 py-1 px-2 text-primary hover:bg-primary/20 ${className}`}
      >
        {action.label}
      </Link>
    )
  }

  return (
    <div
      className={`flex flex-col items-start gap-2 rounded-lg border border-line bg-secondary px-4 py-3 ${className}`}
    >
      <p className={'text-sm font-medium text-ink'}>{props.title}</p>
      {props.detail && <p className={'text-xs text-ink-subtle'}>{props.detail}</p>}
      {loading ? null : (
        <Link
          to={action.to}
          onClick={(event) => event.stopPropagation()}
          className={
            'mt-1 rounded-md bg-primary py-1.5 px-3 text-xs font-semibold text-background hover:opacity-90'
          }
        >
          {action.label}
        </Link>
      )}
    </div>
  )
}

export default Upsell
