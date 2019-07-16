import { cli } from 'tkt'
import { runMain } from './TodoActionsMain'

import * as MongoDB from './MongoDB'

cli()
  .command('$0', 'Collect TODOs and create issues', {}, async args => {
    await runMain()
    await MongoDB.close()
  })
  .parse()
