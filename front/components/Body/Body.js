"use client"

import Owner from '../Voting/Owner'
import Voter from '../Voting/Voter'
import NonRegisteredVoter from '../Voting/NonRegisteredVoter'
import NotConnected from '../Voting/NotConnected'
import React, { useState, useEffect } from 'react'


// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'

// WAGMI
import { useAccount } from 'wagmi'

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json'

import { ethers } from "ethers"



const Body = () => {

    // STATES
    const [isOwner, setIsOwner] = useState(false)
    const [isVoter, setIsVoter] = useState(false)

     // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS
    const { JsonRpcProvider } = require("ethers/providers");


    // GET LOGGED WALLET INFO
    const { isConnected, address } = useAccount()

    async function getOwner() {
        const provider = new JsonRpcProvider("http://localhost:8545");
        const contract = new ethers.Contract(contractAddress, Contract.abi, provider);
      
        const owner = await contract.owner();
        console.log("Owner address:", owner);
        setIsOwner(owner === address) 
    }

    useEffect(() => {
        getOwner()
    }, []);

    
    return (
        <div>
            <Flex width="100%">
                <Flex direction="column" width="100%">
                    <Heading as="h2" size="x1">
                        <Flex width="100%">
                            <Flex direction="column" width="100%">
                                <Heading as="h2" size="x1">
                                {isConnected ? (
                                    <>
                                        {isOwner ? (
                                        <Owner />
                                        ) : isVoter ? (
                                        <Voter />
                                        ) : (
                                        <NonRegisteredVoter />
                                        )}
                                    </>
                                ) : (
                                    <NotConnected />
                                )}
                                </Heading>
                            </Flex>
                        </Flex>
                    </Heading>
                </Flex>
            </Flex>
        </div>
    )
  }

export default Body
