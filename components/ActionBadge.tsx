import { Action } from '@/lib/types';

const ACTION_STYLES: Record<Action, string> = {
  'HIT':       'bg-blue-600 text-white',
  'STAND':     'bg-orange-600 text-white',
  'DOUBLE':    'bg-yellow-500 text-black',
  'SPLIT':     'bg-purple-600 text-white',
  'INSURANCE': 'bg-cyan-600 text-white',
  '-':         'bg-gray-800 text-gray-500',
};

const ACTION_LABELS: Record<Action, string> = {
  'HIT':       'HIT',
  'STAND':     'STAND',
  'DOUBLE':    'DOUBLE',
  'SPLIT':     'SPLIT',
  'INSURANCE': 'INSURANCE',
  '-':         '—',
};

interface ActionBadgeProps {
  action: Action;
  large?: boolean;
}

export default function ActionBadge({ action, large = false }: ActionBadgeProps) {
  if (action === '-') {
    return <span className="text-gray-600 text-sm">waiting</span>;
  }

  const style = ACTION_STYLES[action] ?? ACTION_STYLES['-'];
  const label = ACTION_LABELS[action] ?? action;

  return (
    <span className={`inline-flex items-center rounded-lg font-bold tracking-wide ${style} ${
      large ? 'px-4 py-2 text-sm' : 'px-2.5 py-1 text-xs'
    }`}>
      {label}
    </span>
  );
}
