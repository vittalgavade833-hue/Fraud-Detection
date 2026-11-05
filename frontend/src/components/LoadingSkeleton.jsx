import { useTheme } from '../context/ThemeContext';

const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const { isDark } = useTheme();
  const bg = isDark ? 'bg-navy-700' : 'bg-gray-200';
  const shimmer = isDark
    ? 'bg-gradient-to-r from-navy-700 via-navy-600 to-navy-700'
    : 'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200';

  const Shimmer = ({ className }) => (
    <div className={`${shimmer} animate-shimmer rounded ${className}`}
      style={{ backgroundSize: '200% 100%' }} />
  );

  if (type === 'card') {
    return Array.from({ length: count }).map((_, i) => (
      <div key={i} className={`${isDark ? 'bg-navy-700 border-navy-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <Shimmer className="h-4 w-24 mb-3" />
        <Shimmer className="h-8 w-32 mb-2" />
        <Shimmer className="h-3 w-20" />
      </div>
    ));
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            <Shimmer className="h-10 flex-1" />
            <Shimmer className="h-10 w-24" />
            <Shimmer className="h-10 w-20" />
            <Shimmer className="h-10 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={`${isDark ? 'bg-navy-700 border-navy-600' : 'bg-white border-gray-200'} border rounded-xl p-6`}>
        <Shimmer className="h-5 w-40 mb-4" />
        <Shimmer className="h-64 w-full" />
      </div>
    );
  }

  if (type === 'text') {
    return Array.from({ length: count }).map((_, i) => (
      <Shimmer key={i} className="h-4 w-full mb-2" />
    ));
  }

  return null;
};

export default LoadingSkeleton;
