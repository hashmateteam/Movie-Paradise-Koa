import Movie from '../entity/movie'
import OSS from '../util/oss'
import { improvementLogger as logger } from '../core/log4js'
import * as request from 'superagent'

interface ImprovementService {
  patchPoster(id: number): Promise<void>
  patchBackdrops(id: number, backdrops: Object[]): Promise<void>
  patchTrailers(id: number): Promise<void>
}

export default class ImprovementServiceImpl implements ImprovementService {
  async patchPoster (id: number): Promise<void> {
    await OSS.putPoster(id, logger)
  }

  async patchBackdrops (id: number, backdrops: Object[]): Promise<void> {
    const result = await Movie.update({
      _id: id
    }, {
      backdrops: backdrops
    })
    if (result.raw.affectedRows === 1) {
      logger.info(`added backdrops: id:${id} length:${backdrops.length}`)
    } else {
      logger.error('unexpected affected:', result)
      logger.error('id:', id)
    }
  }

  async patchTrailers (id: number): Promise<void> {
    try {
      const res = await request.get(`https://api.dianying.fm/trailers/${id}`)
      const result = await Movie.update({
        _id: id
      }, {
        trailers: res.body
      })
      if (result.raw.affectedRows === 1) {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        logger.info(`added trailer: id:${id} length:${res.body.length}`)
      } else {
        logger.error('unexpected affected:', result)
        logger.error('trailers:', res.body)
      }
    } catch (err) {
      logger.error('add trailer error:', err)
    }
  }
}
