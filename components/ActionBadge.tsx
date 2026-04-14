import { Action } from '@/lib/types';

const ACTION_STYLES: Record<Action, string> = {
  'HIT':       'bg-blue-500 text-white',
  'STAND':     'bg-orange-500 text-white',
  'DOUBLE':    'bg-yellow-500 text-black',
  'SPLIT':     'bg-purple-500 text-white',
  'SURRENDER': 'bg-red-600 text-white',
  'INSURANCE': 'bg-cyan-500 text-black',
  '-':         'bg-gray-700 text-gray-400',
};

const ACTION_ICONS: Record<Action, string> = {
  'HIT':       '👊',
  'STAND':     '✋',
  'DOUBLE':    '⚡',
  'SPLIT':     '✂️',
  'SURRENDER': '🏳',
  'INSURANCE': '🛡',
  '-':         '—',
};

interface ActionBadgeProps {
  action: Action;
  large?: boolean;
}

export default function ActionBadge({ action, large = false }: ActionBadgeProps) {
  const style = ACTION_STYLES[action] ?? ACTION_STYLES['-'];
  const icon = ACTION_ICONS[action] ?? '';

  if (action === '-') {
    return (
      <span className="text-gray-500 text-sm">waiting...</span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-lg font-bold ${style} ${
      large ? 'px-4 py-2 text-base' : 'px-2.5 py-1 text-xs'
    }`}>
      <span>{icon}</span>
      <span>{action}</span>
    </span>
  );
}
