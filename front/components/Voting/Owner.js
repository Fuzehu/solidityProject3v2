"use client"
import React from 'react'
import { useState, useEffect } from 'react'

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json'
import Ownable from '../../public/artifacts/@openzeppelin/contracts/access/Ownable.sol/Ownable.json'
import { ethers } from "ethers"

// WAGMI
import { prepareWriteContract, writeContract, readContract } from '@wagmi/core'
import { useAccount } from 'wagmi'

// VIEM (events)
import { createPublicClient, http, parseAbiItem } from 'viem'
import { hardhat } from 'viem/chains'


const Owner = () => {

    // RECUP LES INFOS DU LOGGED WALLET 
    const { isConnected, address } = useAccount()

    // CHAKRA-UI TOAST 
    const toast = useToast()

    // STATES
    const [addVoter, setAddVoter] = useState(null)

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS


    // ADDVOTER FUNCTION
    const whitelist = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "addVoter",
                args: [voterAddress],
            })
            await writeContract(request)

            await getEvents()            

            toast({
                title: 'Success !',
                description: `${voterAddress} has been successfully added to the voting whitelist`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            })
        } catch (err) {
            console.log(err);
            toast({
                title: 'Error!',
                description: 'An error occured.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            })
        }



    }

    return (
        <div>
            <Flex width="100%">
            {isConnected ? (
                <Flex direction="column" width="100%">
                    <Heading as='h2' size='xl'>
                        Add a voter address to the voting whitlist
                    </Heading>
                    <Flex mt="1rem">
                        <Input  /*onChange={e => setAddVoter(e.target.value)}*//>
                        <Button colorScheme='whatsapp' onClick={() => whitelist()}>Register Voter</Button>
                    </Flex>
            </Flex>
            ) : (
                <Flex p="2rem" justifyContent="center" alignItems="center" width="100%">
                    <Text>Please connect your Wallet</Text>
                </Flex>
            )}
            
        </Flex>
        </div>
    )
}

export default Owner
