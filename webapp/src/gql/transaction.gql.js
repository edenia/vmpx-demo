import { gql } from '@apollo/client'

export const GET_ESTIMATE_TX = gql`
  query ($input: tx_input!) {
    estimate_tx(input: $input) {
      res
      data
    }
  }
`
