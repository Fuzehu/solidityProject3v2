import React, { useState, useEffect } from 'react';
import { createPublicClient, http, parseAbiItem } from 'viem';
import { hardhat } from 'viem/chains';

// RANDOMIZER
import { v4 as uuidv4 } from 'uuid';

// CHAKRA-UI
import { Heading, Flex, Text, Input, Button, useToast } from '@chakra-ui/react';

// CONTRACT
import Contract from '../../public/artifacts/contracts/Voting.sol/Voting.json';
import Ownable from '../../public/artifacts/@openzeppelin/contracts/access/Ownable.sol/Ownable.json';
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
    const [getProposal, SetGetProposal] = useState(null);
    const [description, setDescription] = useState('');
    const [voteCount, setVoteCount] = useState(0);

    const [setVote, setSetVote] = useState([]);
    const [voterEvent, setVoterEvent] = useState([]);
    const [votedProposalIDEvent, setVotedProposalIDEvent] = useState([]);

    // ENUM NAME STATUS
    const nameWorkflowStatus = [
        'RegisteringVoters',
        'ProposalsRegistrationStarted',
        'ProposalsRegistrationEnded',
        'VotingSessionStarted',
        'VotesTallied'
    ]

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

//////////////////////////////////////////////////////////////////////////////////////

    // GET ONE PROPOSAL 
    const getOneProposal = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "getOneProposal",
                args: [getProposal],
          });
      
          const result = await readContract(request);
          const { description, voteCount } = result; // Extraction des paramètres de l'objet retourné
      
          setDescription(description);
          setVoteCount(voteCount);
      
          toast({
            title: 'Success!',
            description: description,
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

//////////////////////////////////////////////////////////////////////////////////////



    // SET VOTE FUNCTION
    const Vote = async () => {
        try {
        const { request } = await prepareWriteContract({
            address: contractAddress,
            abi: Contract.abi,
            functionName: 'setVote',
            args: [setVote],
        });
        await writeContract(request);

        await getEvents();

        toast({
            title: 'Success !',
            description: `Your vote for the ${setVote} proposal has been successfully registered`,
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

                        ////////////////
                //////////// EVENTS ////////////
                        ////////////////

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
            event: parseAbiItem('event Voted(address indexed voterEvent, uint votedProposalIDEvent)'),
            fromBlock: 0n,
            toBlock: 'latest',
        });
        setVoterEvent(votedLogs.map(log => ({voterEvent: log.args.voterEvent})));
        setVotedProposalIDEvent(votedLogs.map(log => ({votedProposalIDEvent: log.args.votedProposalIDEvent})));
    };

    // GET EVENTS
    const getEvents = async () => {
        await getWhitelistLogs();
        await getWorkflowStatusLogs();
        await getVotedLogs();
        await getProposalRegisteredLogs();
    };

    // Call getEvents when component mounts
    useEffect(() => {
        getEvents();
    }, []);

    return (
        <div>
            { (previousStatus != null ) && 
                <Heading as='h2' size='xl' mt="2rem">
                    Previous Status was {nameWorkflowStatus[previousStatus]}
                </Heading>
            }
            <Heading as='h2' size='xl' mt="2rem">
                Current Status is {nameWorkflowStatus[newStatus]}
            </Heading>

            <Flex width="100%">
                <Flex direction="column" width="100%">
                    <Heading as='h2' size='xl'>
                        Add a proposal to the voting session
                    </Heading>
                    <Flex mt="1rem">
                        <Input  placeholder='Enter a proposal'onChange={e => setAddProposal(e.target.value)}/>
                        <Button colorScheme='whatsapp' onClick={() => Proposal()}>Register Proposal</Button>
            
                    </Flex>
                </Flex>
            </Flex>

            <Heading as='h2' size='xl' mt="2rem">
                Proposals added to the voting session (Events)
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

            <Flex mt="1rem">
            <Input  placeholder='Enter a given proposal ID'onChange={e => SetGetProposal(e.target.value)}/>
            <Button colorScheme='whatsapp' onClick={() => getOneProposal()}>Get Proposal from ID</Button>
            </Flex>

        </div>
    );
};

export default Voter;