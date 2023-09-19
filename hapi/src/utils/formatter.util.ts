export const formatLibreVmpxToEthVmpx = (vmpx: string) => {
  return vmpx
    .split(' ')[0]
    .padEnd(vmpx.indexOf('.') + 1 + 18, '0')
    .replace('.', '')
}
