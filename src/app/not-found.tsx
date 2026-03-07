import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Страница не найдена</h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">
          Страница, которую вы ищете, не существует или была перемещена.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">На главную</Link>
        </div>
      </div>
    </div>
  );
}
