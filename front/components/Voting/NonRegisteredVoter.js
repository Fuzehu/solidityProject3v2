"use client"
import React from 'react'

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json'

//import { ethers } from "ethers"

const NonRegisteredVoter = () => {

    // STATES

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS


    return (
        <div>
            {/*You are not authorized to take part to the voting session*/}
        </div>
    )
}

export default NonRegisteredVoter
