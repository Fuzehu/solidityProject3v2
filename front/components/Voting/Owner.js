"use client"
import React from 'react'
import { useState, useEffect } from 'react'

// RANDOMIZER
import { v4 as uuidv4 } from 'uuid';

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react'

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json'
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

    const [previousStatus, setPreviousStatus] = useState(null)
    const [newStatus, setNewStatus] = useState(0)

    const [vote, setVote] = useState(0);
    const [voterEvent, setVoterEvent] = useState([]);
    const [votedProposalIDEvent, setVotedProposalIDEvent] = useState([]);

    const [winningProposalId, setWinningProposalId] = useState([]);

    

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

    // ENUM NAME STATUS
    const nameWorkflowStatus = [
            'RegisteringVoters',
            'ProposalsRegistrationStarted',
            'ProposalsRegistrationEnded',
            'VotingSessionStarted',
            'VotesTallied'
        ]


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

            await getWhitelistLogs()            

            toast({
                title: 'Success !',
                description: `${addVoter} has been successfully added to the voting whitelist`,
                status: 'success',
                duration: 5000,
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

            await getWorkflowStatusLogs()            

            toast({
                title: 'Success !',
                description: `Proposals Registration Started`,
                status: 'success',
                duration: 5000,
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

            await getWorkflowStatusLogs()            

            toast({
                title: 'Success !',
                description: `Proposals Registration Session Ended`,
                status: 'success',
                duration: 5000,
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

            await getWorkflowStatusLogs()            

            toast({
                title: 'Success !',
                description: `Voting Session Started`,
                status: 'success',
                duration: 5000,
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

            await getWorkflowStatusLogs()            

            toast({
                title: 'Success !',
                description: `Voting Session Ended, Votes are Tallied`,
                status: 'success',
                duration: 5000,
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


    const getWinningProposalId = async () => {
        try {
        const { request } = await prepareWriteContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: 'winningProposalID',
        });
        const winningProposalId = await readContract(request);

        setWinningProposalId(winningProposalId.toString())
        console.log(winningProposalId)

        toast({
            title: 'Success !',
            description: `The winning proposal ID is ${winningProposalId}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
        });
        } catch (err) {
        console.log(err);
        toast({
            title: 'Error!',
            description: 'An error occurred.',
            status: 'error',
            duration: 3000,
            isClosable: true,
        });
        }
    };

    //GET VOTER REGISTERED EVENT
    const getWhitelistLogs = async () => {
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

    // //GET WORKFLOW STATUS CHANGE EVENT
    const getWorkflowStatusLogs = async () => {
        const workflowStatusLogs = await client.getLogs({
            event: parseAbiItem('event WorkflowStatusChange(uint8 previousStatus, uint8 newStatus)'),
            fromBlock: 0n,
            toBlock: 'latest' // default value
        })
        try {
            setPreviousStatus(workflowStatusLogs[workflowStatusLogs.length - 1].args.previousStatus)
            setNewStatus(workflowStatusLogs[workflowStatusLogs.length - 1].args.newStatus)
        } catch {}
    }

    // GET VOTED EVENT
    const getVotedLogs = async () => {
        const votedLogs = await client.getLogs({
            event: parseAbiItem('event Voted(address voterEvent, uint votedProposalIDEvent)'),
            fromBlock: 0n,
            toBlock: 'latest',
        });
        setVoterEvent(votedLogs.map(log => ({voterEvent: log.args.voterEvent})));
        setVotedProposalIDEvent(votedLogs.map(log => ({votedProposalIDEvent: log.args.votedProposalIDEvent.toString()})));
    };

    useEffect(() => {
        getWhitelistLogs()
        getWorkflowStatusLogs()
        getVotedLogs()
    }, []);




    return (
        <div>
            <Flex direction="column" width="100%">
                <Flex>
                { (previousStatus != null ) && 
                    <Heading as='h2' size='xl' mt="2rem">
                        Previous Status was {nameWorkflowStatus[previousStatus]}
                    </Heading>
                }
                </Flex>
                <Heading as='h2' size='xl' mt="1rem">
                    Current Status is {nameWorkflowStatus[newStatus]}
                </Heading>
            </Flex>


            <Flex mt="2rem" direction="column">
                <Heading as='h2' size='xl'>
                    Whitelisted Voter Addresses (Events)
                </Heading>
                <Flex direction="column">
                    { whitelistEvent.length > 0 ? whitelistEvent.map((event) => {
                        return <Flex key={uuidv4()}>
                                <Text>
                                    {event.address}
                                </Text>
                            </Flex>
                    }) : (
                        <Text>No Address Whitelisted to this stage</Text>
                    )}
                </Flex>
            </Flex>
            
            
            <Flex mt='2rem'direction="column">
                                    <Heading as='h2' size='xl' mt="2rem" direction="column">
                                        Vote Logs : display the voted proposal of a specific voter address (events)
                                    </Heading>
                                    <Flex direction="column">
                                        {voterEvent.length > 0 && votedProposalIDEvent.length > 0 ? (
                                            <React.Fragment>
                                                {voterEvent.map((addr, index) => {
                                                    const voter = addr.voterEvent;
                                                    const proposalID = votedProposalIDEvent[index].votedProposalIDEvent;
                                                    return (
                                                        <React.Fragment key={uuidv4()}>
                                                            <Text key={uuidv4()}>
                                                                Voter {voter} voted proposal ID number {proposalID}
                                                            </Text>
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </React.Fragment>
                                        ) : (
                                            <Text>No Vote completed at this stage</Text>
                                        )}
                                    </Flex>
                                </Flex>

            { newStatus == 0 && <>      
                                    <Flex mt='2rem' width="100%">
                                        <Flex direction="column" width="100%">
                                            <Heading as='h2' size='xl'>
                                                Add a voter address to the voting whitelist
                                            </Heading>
                                            <Flex mt="1rem">
                                                <Input  placeholder='Enter address to whitelist'onChange={e => setAddVoter(e.target.value)}/>
                                                <Button colorScheme='whatsapp' onClick={() => whitelist()}>Register Voter</Button>
                                            </Flex>
                                        </Flex>
                                    </Flex>

                                    <Flex>
                                        <Heading as='h2' size='xl' mt="2rem">
                                            2nd Workflow Status - Voters can suggest Proposals for the voting session
                                        </Heading>
                                        <Flex mt="1rem">
                                            <Button colorScheme='whatsapp' onClick={() => startProposalsRegistering()}>Start Proposals Registering</Button>
                                        </Flex>
                                    </Flex>
                                </>
            }           
                        
            { newStatus == 1 && <>
                                    <Heading as='h2' size='xl' mt="2rem">
                                        3rd Workflow Status - End the Proposals Registration for the voting session
                                    </Heading>
                                    <Flex mt="1rem">
                                        <Button colorScheme='whatsapp' onClick={() => endProposalsRegistering()}>End Proposals Registering</Button>
                                    </Flex>
                                </>
            }           
                        
            { newStatus == 2 && <>
                                    <Heading as='h2' size='xl' mt="2rem">
                                        4th Workflow Status - Voters can now vote for the Proposal of their choice
                                    </Heading>
                                    <Flex mt="1rem">
                                        <Button colorScheme='whatsapp' onClick={() => startVotingSession()}>Start Voting Session</Button>
                                    </Flex>
                                </>
            }           
                        
            { newStatus == 3 && <>
                                    <Heading as='h2' size='xl' mt="2rem">
                                        5th Workflow Status - Voters can now check the Winning Proposal
                                    </Heading>
                                    <Flex mt="1rem">
                                        <Button colorScheme='whatsapp' onClick={() => tallyVotes()}>End Voting Session and Tally the Vote</Button>
                                    </Flex>
                                </>
            }   

            { newStatus == 4 && <>
                                    <Flex mt='2rem' width="100%">
                                        <Flex direction="column" width="100%">
                                            <Button colorScheme='whatsapp' onClick={() => getWinningProposalId()}>Get the Winning Proposal ID</Button>
                                            <Heading as='h2' size='xl'>
                                                The Voting Session has now ended and the Winning Proposal has the ID number {winningProposalId}
                                            </Heading>
                                        </Flex>
                                    </Flex>
                                </>
            }

        </div>
    )
}

export default Owner