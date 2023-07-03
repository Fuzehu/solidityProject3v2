import React, { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { hardhat } from 'viem/chains';
import Header from '../Header/Header';

// RANDOMIZER
import { v4 as uuidv4 } from 'uuid';

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react';

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json';
import { ethers } from 'ethers';

// WAGMI
import { prepareWriteContract, prepareReadContract, writeContract, readContract } from '@wagmi/core';
import { useAccount } from 'wagmi';

const Voter = () => {
    // CREATE VIEM CLIENT
    const client = createPublicClient({
        chain: hardhat,
        transport: http(),
    });

    // GET LOGGED WALLET INFO
    const { isConnected, address } = useAccount();

    // CHAKRA-UI TOAST
    const toast = useToast();

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;
    const { JsonRpcProvider } = require("ethers/providers");

    // STATES
    const [whitelistEvent, setWhitelistEvent] = useState([])

    const [previousStatus, setPreviousStatus] = useState(null)
    const [newStatus, setNewStatus] = useState(0)

    const [addProposal, setAddProposal] = useState(null);
    const [addProposalEvent, setAddProposalEvent] = useState([]);

    const [getProposal, setGetProposal] = useState('');
    const [description, setDescription] = useState('');
    const [voteCount, setVoteCount] = useState(0);

    //const [proposalsList, setProposalsList] = useState([]);
    //const [proposalNumber, setProposalNumber] = useState(0);

    const [vote, setVote] = useState(0);
    const [voterEvent, setVoterEvent] = useState([]);
    const [votedProposalIDEvent, setVotedProposalIDEvent] = useState([]);

    const [winningProposalId, setWinningProposalId] = useState([]);

    // ENUM NAME STATUS
    const nameWorkflowStatus = [
        'RegisteringVoters',
        'ProposalsRegistrationStarted',
        'ProposalsRegistrationEnded',
        'VotingSessionStarted',
        'VotesTallied'
    ]

    // ::::::::::::: FUNCTION ::::::::::::: // 


    // ADDPROPOSAL FUNCTION
    const Proposal = async () => {
        try {
        const { request } = await prepareWriteContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: 'addProposal',
            args: [addProposal],
        });
        await writeContract(request);

        await getEvents();

        toast({
            title: 'Success !',
            description: `${addProposal} has been successfully added as proposal to the voting session`,
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


    // GET ONE PROPOSAL 
    const getOneProposal = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getOneProposal",
                args: [getProposal,],
          });
      
          const result = await readContract(request);
          const { description, voteCount } = result; // Extraction des paramètres de l'objet retourné
      
          setDescription(description);
          setVoteCount(voteCount)
      
          toast({
            title: `The corresponding proposal is : ${description}`,
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


    // SET VOTE FUNCTION
    const Vote = async () => {
        try {
        const { request } = await prepareWriteContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: 'setVote',
            args: [vote],
        });
        await writeContract(request);

        await getVotedLogs();

        toast({
            title: 'Success !',
            description: `Your vote for the Proposal ID ${vote} has been successfully registered`,
            status: 'success',
            duration: 3000,
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

    /*const getWinningProposalId = async () => {
        const winningProposalId = await Contract.abi.read.winningProposalID();
        setWinningProposalId(winningProposalId.toString())
    }*/

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
            title: `The winning proposal ID is : ${winningProposalId}`,
            status: 'success',
            duration: 3000,
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


    // GET ONE PROPOSALVOTECOUNT
    const getOneProposalVoteCount = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getOneProposal",
                args: [getProposal],
            })

            const result = await readContract(request)
            const { description, voteCount } = result; 
      
            setDescription(description);
            setVoteCount(voteCount)

            toast({
                title: `The Vote Count for this proposal is : ${voteCount}`,
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


    // ::::::::::::: EVENTS ::::::::::::: // 

    // GET WHITELISTED USERS EVENT
    const getWhitelistLogs = async () => {
        const whitelistLogs = await client.getLogs({
            event: parseAbiItem('event VoterRegistered(address voterAddress)'),
            fromBlock: 0n,
            toBlock: 'latest',
        });
        setWhitelistEvent(whitelistLogs.map(log => log.args.voterAddress));
    };

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

    // GET PROPOSAL REGISTERED EVENT
    const getProposalRegisteredLogs = async () => {
        const addProposalEventLogs = await client.getLogs({
            event: parseAbiItem('event ProposalRegistered(uint addProposalEvent)'),
            fromBlock: 0n,
            toBlock: 'latest' // default value
        })
        setAddProposalEvent(addProposalEventLogs.map(log => ({id: log.args.addProposalEvent})))
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


    // GET EVENTS
    const getEvents = async () => {
        await getWhitelistLogs();
        await getWorkflowStatusLogs();
        await getProposalRegisteredLogs();
        await getVotedLogs();
    };

    // CALL ALL EVENTS WHEN COMPONENTS MOUNT
    useEffect(() => {
        getEvents();
    }, []);


    // ::::::::::::: RENDER ::::::::::::: // 


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
                <Heading as='h2' size='xl'>
                    Current Status is {nameWorkflowStatus[newStatus]}
                </Heading>
            </Flex>


            <Flex mt='1rem' width="100%">
                <Flex direction="column" width="100%">
                    <Heading as='h2' size='xl'>
                        Add a proposal to the voting session
                    </Heading>
                    <Flex mt="1rem">
                        <Input  placeholder='Enter the proposal you want to submit to the voting session'onChange={e => setAddProposal(e.target.value)}/>
                        <Button colorScheme='whatsapp' onClick={() => Proposal()}>Register Proposal</Button>
                    </Flex>
                </Flex>
            </Flex>

            
            <Flex direction="column">
                <Heading as='h2' size='xl' mt="2rem">
                    Proposals added to the voting session (events)
                </Heading>
                <Flex mt="1rem" direction="column"></Flex>
                    { addProposalEvent.length > 0 ? addProposalEvent.map((event) => {
                        return <Flex key={uuidv4()}>
                                <Text>
                                    {event.id.toString()}
                                </Text>
                        </Flex>
                    }) : (
                        <Text>No Proposals added at this stage</Text>
                    )}
                <Flex />
            </Flex>


            <Flex mt="1rem">
                <Input  placeholder='Enter a valid proposal ID'onChange={e => setGetProposal(e.target.value)}/>
                <Button colorScheme='whatsapp' onClick={() => getOneProposal()}>Get Proposal name</Button>
            </Flex>


            <Flex mt='1rem' width="100%">
                <Flex direction="column" width="100%">
                    <Heading as='h2' size='xl'>
                        Choose the proposal that you want to vote for
                    </Heading>
                    <Flex mt="1rem">
                        <Input  placeholder='Enter the proposal ID of your choice'onChange={e => setVote(e.target.value)}/>
                        <Button colorScheme='whatsapp' onClick={() => Vote()}>Vote</Button>
            
                    </Flex>
                </Flex>
            </Flex>


            <Flex direction="column">
                <Heading as='h2' size='xl' mt="2rem" direction="column">
                    Vote Logs : display the voted proposal of a specific voter address (events)
                </Heading>
                <Flex mt="1rem" direction="column">
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


            <Flex mt='1rem' mb='1rem' width="100%">
                <Flex direction="column" width="100%">
                    <Button colorScheme='whatsapp' onClick={() => getWinningProposalId()}>Get the Winning Proposal ID</Button>
                    <Heading mt='1rem' as='h2' size='xl'>
                        The Voting Session has now ended and the Winning Proposal ID is {winningProposalId}
                    </Heading>
                </Flex>
            </Flex>

            <Flex mt="1rem">
                <Input  placeholder='Enter a valid proposal ID'onChange={e => setGetProposal(e.target.value)}/>
                <Button colorScheme='whatsapp' onClick={() => getOneProposalVoteCount()}>Get Proposal vote count</Button>
            </Flex>


        </div>
    );
};

export default Voter;