"use client"

import React from 'react'
import Owner from '../Voting/Owner'
import Voter from '../Voting/Voter'
import NonResgisteredVoter from '../Voting/NonResgisteredVoter'

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json'
import Ownable from '../../public/artifacts/@openzeppelin/contracts/access/Ownable.sol/Ownable.json'



//import { ethers } from "ethers"


const Body = () => {

    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    
    return (
        <div>
            <Flex width="100%">
                <Flex direction="column" width="100%">
                      <Heading as="h2" size="x1">
                          <p>Welcome ...Role</p>
                          <hr />
                          <p>(définir composants en fonction de si Owner - Voter - ou Unregistered Voter)</p>
                          <Owner />
                      </Heading>
                </Flex>
            </Flex>
        </div>
    )
  }

export default Body
