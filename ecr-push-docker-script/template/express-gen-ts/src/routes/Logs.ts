import { Request, Response, Router } from 'express';
import { BAD_REQUEST, CREATED, OK } from 'http-status-codes';
import { ParamsDictionary } from 'express-serve-static-core';

import UserDao from '@daos/User/UserDao.mock';
import { paramMissingError } from '@shared/constants';
import { promises as fs } from 'fs';
import * as path from 'path';

// Init shared
const router = Router();
const userDao = new UserDao();

/******************************************************************************
 *                      Get All Users - "GET /api/users/all"
 ******************************************************************************/

router.get('/all', async (req: Request, res: Response) => {
    // @todo Read the log file and return its results
    const log = await fs.readFile(path.resolve(__dirname, '../../output.log'), 'utf8');
    //const users = await userDao.getAll();
    const taskJson = {
        logContents: log
    };
    return res.status(OK).json({taskJson});
});

/******************************************************************************
 *                                     Export
 ******************************************************************************/

export default router;
