"use client"

import React from 'react'

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'

// CONTRACT

import Contract from '../../../backend/artifacts/contracts/Voting.sol/Voting.json'
import Ownable from '../../../backend/artifacts/@openzeppelin/contracts/access/Ownable.sol/Ownable.json'

//import { ethers } from "ethers"

const Voting = () => {
  return (
    <div>
      <Flex width="100%">
        <Flex direction="column" width="100%">
            <Heading as="h2" size="x1">
                <p>Welcome ...Role</p>
                <hr />
                <p>(définir composants en fonction de si Owner - Voter - ou Unregistered Voter)</p>

            </Heading>
        </Flex>
      </Flex>
    </div>
  )
}

export default Voting
