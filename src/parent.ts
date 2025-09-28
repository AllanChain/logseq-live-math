import { MathfieldElement } from 'mathlive'
import { ComputeEngine } from '@cortex-js/compute-engine'

MathfieldElement.computeEngine = new ComputeEngine()
MathfieldElement.fontsDirectory = new URL('css/fonts', location.href).href
MathfieldElement.soundsDirectory = null
