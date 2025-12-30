const visitor = async (req, res, next) => {
   await global.db.run('UPDATE statistic SET visitor = visitor + 1')
   next()
}

const hit = async (req, res, next) => {
   await global.db.run('UPDATE statistic SET hit = hit + 1')
   next()
}

export { visitor, hit }