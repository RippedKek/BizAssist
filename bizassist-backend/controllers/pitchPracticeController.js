const pitchPracticeService = require('../services/pitchPracticeService')

exports.assessPitchPractice = async (req, res, next) => {
  try {
    const { slideBoundaries, totalSlides, referencePitch } = req.body

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Audio file is required' })
    }

    const audioBuffer = req.file.buffer
    const boundaries = JSON.parse(slideBoundaries || '[]')
    const refPitch = referencePitch ? JSON.parse(referencePitch) : null

    const result = await pitchPracticeService.processAndAssess({
      audioBuffer,
      slideBoundaries: boundaries,
      totalSlides: Number(totalSlides) || boundaries.length || 0,
      referencePitch: refPitch,
    })

    return res.json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}


