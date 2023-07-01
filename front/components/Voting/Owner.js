"use client"
import React from 'react'
import { useState, useEffect } from 'react'

import { v4 as uuidv4 } from 'uuid';

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

    // CREATE VIEM CLIENT
    const client = createPublicClient({
        chain: hardhat,
        transport: http(),
    })

    // GET LOGGED WALLET INFO
    const { isConnected, address } = useAccount()

    // CHAKRA-UI TOAST 
    const toast = useToast()

    // STATES
    const [addVoter, setAddVoter] = useState(null)
    const [whitelistEvent, setWhitelistEvent] = useState([])

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS


    // ADDVOTER FUNCTION
    const whitelist = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "addVoter",
                args: [addVoter],
            })

            await writeContract(request)

            await getEvents()            

            toast({
                title: 'Success !',
                description: `${addVoter} has been successfully added to the voting whitelist`,
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

    // START PROPOSAL REGISTERING FUNCTION
    const startProposalsRegistering = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "startProposalsRegistering",
            })

            await writeContract(request)

            await getEvents()            

            toast({
                title: 'Success !',
                description: `Proposals Registration Started`,
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

    // END PROPOSAL REGISTERING FUNCTION
    const endProposalsRegistering = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "endProposalsRegistering",
            })

            await writeContract(request)

            await getEvents()            

            toast({
                title: 'Success !',
                description: `Proposals Registration Session Ended`,
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

    // START VOTING SESSSION FUNCTION
    const startVotingSession = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "startVotingSession",
            })

            await writeContract(request)

            await getEvents()            

            toast({
                title: 'Success !',
                description: `Voting Session Started`,
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

    // TALLY VOTES FUNCTION
    const tallyVotes = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "tallyVotes",
            })

            await writeContract(request)

            await getEvents()            

            toast({
                title: 'Success !',
                description: `Voting Session Ended, Votes are Tallied`,
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


    // GET EVENTS
    const getEvents = async () => {
        //GET VOTER REGISTERED EVENT
        const whitelistLogs = await client.getLogs({
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
            toBlock: 'latest' // default value
        })
        setWhitelistEvent(whitelistLogs.map(
            log => ({
                address: log.args.voterAddress
            })
        ))
    }


    useEffect(() => {
        getEvents();
      }, []);


    return (
        <div>
            <Heading as='h2' size='xl' mt="2rem">
                Current Status is ...
            </Heading>
            
            <Flex width="100%">
                Owner has to be whitelisted in order to check who is whitelisted (getVoter has onlyVoter modifier)
            </Flex>
            <Flex width="100%">
            {isConnected ? (
                <Flex direction="column" width="100%">
                    <Heading as='h2' size='xl'>
                        Add a voter address to the voting whitelist
                    </Heading>
                    <Flex mt="1rem">
                        <Input  placeholder='Enter address to whitelist'onChange={e => setAddVoter(e.target.value)}/>
                        <Button colorScheme='whatsapp' onClick={() => whitelist()}>Register Voter</Button>
                    </Flex>
            </Flex>
            ) : (
                <Flex p="2rem" justifyContent="center" alignItems="center" width="100%">
                    <Text>Please connect your Wallet</Text>
                </Flex>
            )}  
            </Flex>

            <Heading as='h2' size='xl' mt="2rem">
                Whitelist Events
            </Heading>

            <Flex mt="1rem" direction="column"></Flex>
                { whitelistEvent.length > 0 ? whitelistEvent.map((event) => {
                    return <Flex key={uuidv4()}>
                            <Text>
                                {event.address}
                            </Text>
                        </Flex>
                }) : (
                    <Text>No Address Whitelisted to this date</Text>
                )}
            <Flex />

            <Heading as='h2' size='xl' mt="2rem">
                2nd Workflow Status - Voters can suggest Proposals for the voting session
            </Heading>
            <Flex mt="1rem">
                <Button colorScheme='whatsapp' onClick={() => startProposalsRegistering()}>Start Proposals Registering</Button>
            </Flex>

            <Heading as='h2' size='xl' mt="2rem">
                3rd Workflow Status - Voters can suggest Proposals for the voting session
            </Heading>
            <Flex mt="1rem">
                <Button colorScheme='whatsapp' onClick={() => endProposalsRegistering()}>End Proposals Registering</Button>
            </Flex>

            <Heading as='h2' size='xl' mt="2rem">
                4th Workflow Status - Voters can now vote for the Proposal of their choice
            </Heading>
            <Flex mt="1rem">
                <Button colorScheme='whatsapp' onClick={() => startVotingSession()}>Start Voting Session</Button>
            </Flex>

            <Heading as='h2' size='xl' mt="2rem">
                5th Workflow Status - Voters can now check the Winning Proposal
            </Heading>
            <Flex mt="1rem">
                <Button colorScheme='whatsapp' onClick={() => tallyVotes()}>End Voting Session and Tally the Vote</Button>
            </Flex>
</div>
    )
}

export default Owner