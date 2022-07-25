import { withIronSessionApiRoute } from 'iron-session/next';
import { sessionOptions } from '../../../common/session';

import type { NextApiRequest, NextApiResponse } from 'next';

function destroySessionRoute(req: NextApiRequest, res: NextApiResponse) {
  req.session.destroy();
  res.json(null);
}

export default withIronSessionApiRoute(destroySessionRoute, sessionOptions);
