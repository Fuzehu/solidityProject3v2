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

const Voter = () => {

    // CREATE VIEM CLIENT
    const client = createPublicClient({
        chain: hardhat,
        transport: http(),
    })

        // GET LOGGED WALLET INFO
    const { isConnected, address } = useAccount()

    // CHAKRA-UI TOAST 
    const toast = useToast()

    // CONTRACT ADDRESS
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS

    // STATES
    const [addProposal, setAddProposal] = useState(null)
    const [setVote, setSetVote] = useState([])
    const [voterEvent, setVoterEvent] = useState([])
    const [votedProposalIDEvent, setVotedProposalIDEvent] = useState([])

    // ADDPROPOSAL FUNCTION
    const Proposal = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "addProposal",
                args: [addProposal],
            })
            await writeContract(request)

            await getEvents()            

            toast({
                title: 'Success !',
                description: `${addProposal} has been successfully added as proposal to the voting session`,
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


    // ADDPROPOSAL FUNCTION
    const Vote = async () => {
        try {
            const { request } = await prepareWriteContract({
                address: contractAddress,
                abi: Contract.abi,
                functionName: "setVote",
                args: [setVote],
            })
            await writeContract(request)

            await getEvents()            

            toast({
                title: 'Success !',
                description: `Your vote for the ${setVote} proposal has been successfully registered`,
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


    //GET PROPOSAL REGISTERED EVENT
    const getProposalRegisteredLogs = async () => {
        const ProposalRegisteredLogs = await client.getLogs({
            event: parseAbiItem('event ProposalRegistered(uint proposalId)'),
            fromBlock: 0n,
            toBlock: 'latest' // default value
        })
        setSetVote(ProposalRegisteredLogs.map(
            log => ({
                addedProposal: log.args.proposalId
            })
        ))
    }

    // //GET VOTED EVENT
    const getVotedLogs = async () => {
        const VotedLogs = await client.getLogs({
            event: parseAbiItem('event Voted(address indexed voterEvent, uint votedProposalIDEvent)'),
            fromBlock: 0n,
            toBlock: 'latest' // default value
        })
        try {
            setVoterEvent(VotedLogs.map[voterEvent]) // pas un map mais afficher le vote du voter sur son écran?
            setVotedProposalIDEvent(VotedLogs.map[votedProposalIDEvent]) // pas un map mais afficher le vote du voter sur son écran?
        } catch {}
    }


    return (
        <div>
      
        </div>
    )
}

export default Voter
