"use client"

import Owner from '../Voting/Owner'
import Voter from '../Voting/Voter'
import NonRegisteredVoter from '../Voting/NonRegisteredVoter'
import NotConnected from '../Voting/NotConnected'
import React, { useState, useEffect } from 'react'

// CHAKRA-UI
import { Heading, Flex } from '@chakra-ui/react'

// WAGMI
import { prepareWriteContract, prepareReadContract, writeContract, readContract } from '@wagmi/core';
import { useAccount } from 'wagmi';

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json'
import { ethers } from "ethers"

const Body = () => {

    // STATES
    const [isOwner, setIsOwner] = useState(null)
    const [voterAddr, setVoterAddr] = useState('')
    const [isVoter, setIsVoter] = useState(null)

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    const { JsonRpcProvider } = require("ethers/providers");

    // GET LOGGED WALLET INFO
    const { isConnected, address } = useAccount()

    useEffect(() => {
        async function getOwner() {
            const provider = new JsonRpcProvider(/*"http://localhost:8545"*/);
            const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
            const owner = await contract.owner();
            setIsOwner(owner === address)
        }

        if (isConnected) {
            getOwner()
        } 
    }, [isConnected]);

    return (
        <div>
            {isConnected ? (
                <Flex width="100%">
                    <Flex direction="column" width="100%">
                        <Heading as="h2" size="x1">
                            {isOwner === null ? (
                                "Loading..."
                            ) : isOwner ? (
                                <Owner />
                            ) : ( 
                                <>
                                    <Voter />
                                    {/*<NonRegisteredVoter />*/}
                                </>
                            )}
                        </Heading>
                    </Flex>
                </Flex>
            ) : (
                <NotConnected />
            )}
        </div>
    )
}

export default Body
