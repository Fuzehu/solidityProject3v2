"use client"
import React from 'react'

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json'
import Ownable from '../../public/artifacts/@openzeppelin/contracts/access/Ownable.sol/Ownable.json'

//import { ethers } from "ethers"

const NonRegisteredVoter = () => {

    // STATES

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS


    return (
        <div>
      
        </div>
    )
}

export default NonRegisteredVoter
