import { Timecode } from '../types'

const SECONDS_IN_MINUTE = 60
const SECONDS_IN_HOUR = 3600

export const timecodeToSeconds = ({ hours, minutes, seconds }: Timecode): number =>
  hours * SECONDS_IN_HOUR + minutes * SECONDS_IN_MINUTE + seconds
