import getSocketServer from '@/lib/socketServer';

export function GET(req) {
  if (req.nextUrl.pathname === '/api/socket') {
    const res = new Response(null, {
      status: 200,
    });

    getSocketServer(res);
    return res;
  }

  return new Response('Not found', { status: 404 });
}
