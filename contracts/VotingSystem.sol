// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingSystem {
    address public admin;
    
    struct Election {
        uint256 id;
        string title;
        string description;
        string electionType; // "state" or "college"
        uint256 startDate;
        uint256 endDate;
        bool exists;
    }
    
    struct Candidate {
        uint256 id;
        uint256 electionId;
        string name;
        string party;
        string bio;
        string imageUrl;
        bool exists;
    }
    
    struct Vote {
        uint256 electionId;
        uint256 candidateId;
        address voter;
        uint256 timestamp;
    }
    
    // Storage
    uint256 public electionCount;
    uint256 public candidateCount;
    uint256 public voteCount;
    
    mapping(uint256 => Election) public elections;
    mapping(uint256 => Candidate) public candidates;
    mapping(uint256 => Vote) public votes;
    
    // Track votes per election per voter (to prevent double voting)
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    
    // Track vote counts per candidate
    mapping(uint256 => uint256) public candidateVotes;
    
    // Get candidates by election
    mapping(uint256 => uint256[]) public electionCandidates;
    
    // Verified voters
    mapping(address => bool) public verifiedVoters;
    mapping(address => string) public voterIds;
    
    // Events
    event ElectionCreated(uint256 indexed electionId, string title, string electionType);
    event ElectionUpdated(uint256 indexed electionId, string title);
    event CandidateAdded(uint256 indexed candidateId, uint256 indexed electionId, string name);
    event CandidateUpdated(uint256 indexed candidateId, string name);
    event VoteCast(uint256 indexed voteId, uint256 indexed electionId, uint256 indexed candidateId, address voter);
    event VoterVerified(address indexed voter, string voterId);
    event AdminTransferred(address indexed previousAdmin, address indexed newAdmin);
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }
    
    modifier onlyVerifiedVoter() {
        require(verifiedVoters[msg.sender], "Voter not verified");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    // Admin functions
    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "Invalid address");
        emit AdminTransferred(admin, newAdmin);
        admin = newAdmin;
    }
    
    function verifyVoter(address voter, string calldata voterId) external onlyAdmin {
        verifiedVoters[voter] = true;
        voterIds[voter] = voterId;
        emit VoterVerified(voter, voterId);
    }
    
    function revokeVoter(address voter) external onlyAdmin {
        verifiedVoters[voter] = false;
        voterIds[voter] = "";
    }
    
    // Election management
    function createElection(
        string calldata title,
        string calldata description,
        string calldata electionType,
        uint256 startDate,
        uint256 endDate
    ) external onlyAdmin returns (uint256) {
        require(endDate > startDate, "End date must be after start date");
        
        electionCount++;
        elections[electionCount] = Election({
            id: electionCount,
            title: title,
            description: description,
            electionType: electionType,
            startDate: startDate,
            endDate: endDate,
            exists: true
        });
        
        emit ElectionCreated(electionCount, title, electionType);
        return electionCount;
    }
    
    function updateElection(
        uint256 electionId,
        string calldata title,
        string calldata description,
        uint256 startDate,
        uint256 endDate
    ) external onlyAdmin {
        require(elections[electionId].exists, "Election does not exist");
        require(endDate > startDate, "End date must be after start date");
        
        elections[electionId].title = title;
        elections[electionId].description = description;
        elections[electionId].startDate = startDate;
        elections[electionId].endDate = endDate;
        
        emit ElectionUpdated(electionId, title);
    }
    
    // Candidate management
    function addCandidate(
        uint256 electionId,
        string calldata name,
        string calldata party,
        string calldata bio,
        string calldata imageUrl
    ) external onlyAdmin returns (uint256) {
        require(elections[electionId].exists, "Election does not exist");
        
        candidateCount++;
        candidates[candidateCount] = Candidate({
            id: candidateCount,
            electionId: electionId,
            name: name,
            party: party,
            bio: bio,
            imageUrl: imageUrl,
            exists: true
        });
        
        electionCandidates[electionId].push(candidateCount);
        
        emit CandidateAdded(candidateCount, electionId, name);
        return candidateCount;
    }
    
    function updateCandidate(
        uint256 candidateId,
        string calldata name,
        string calldata party,
        string calldata bio,
        string calldata imageUrl
    ) external onlyAdmin {
        require(candidates[candidateId].exists, "Candidate does not exist");
        
        candidates[candidateId].name = name;
        candidates[candidateId].party = party;
        candidates[candidateId].bio = bio;
        candidates[candidateId].imageUrl = imageUrl;
        
        emit CandidateUpdated(candidateId, name);
    }
    
    // Voting
    function castVote(uint256 electionId, uint256 candidateId) external onlyVerifiedVoter returns (uint256) {
        require(elections[electionId].exists, "Election does not exist");
        require(candidates[candidateId].exists, "Candidate does not exist");
        require(candidates[candidateId].electionId == electionId, "Candidate not in this election");
        require(!hasVoted[electionId][msg.sender], "Already voted in this election");
        require(block.timestamp >= elections[electionId].startDate, "Election has not started");
        require(block.timestamp <= elections[electionId].endDate, "Election has ended");
        
        hasVoted[electionId][msg.sender] = true;
        candidateVotes[candidateId]++;
        
        voteCount++;
        votes[voteCount] = Vote({
            electionId: electionId,
            candidateId: candidateId,
            voter: msg.sender,
            timestamp: block.timestamp
        });
        
        emit VoteCast(voteCount, electionId, candidateId, msg.sender);
        return voteCount;
    }
    
    // View functions
    function getElection(uint256 electionId) external view returns (
        uint256 id,
        string memory title,
        string memory description,
        string memory electionType,
        uint256 startDate,
        uint256 endDate,
        bool exists
    ) {
        Election storage e = elections[electionId];
        return (e.id, e.title, e.description, e.electionType, e.startDate, e.endDate, e.exists);
    }
    
    function getCandidate(uint256 candidateId) external view returns (
        uint256 id,
        uint256 electionId,
        string memory name,
        string memory party,
        string memory bio,
        string memory imageUrl,
        uint256 voteCount_
    ) {
        Candidate storage c = candidates[candidateId];
        return (c.id, c.electionId, c.name, c.party, c.bio, c.imageUrl, candidateVotes[candidateId]);
    }
    
    function getElectionCandidateIds(uint256 electionId) external view returns (uint256[] memory) {
        return electionCandidates[electionId];
    }
    
    function getVoterStatus(address voter) external view returns (bool isVerified, string memory voterId) {
        return (verifiedVoters[voter], voterIds[voter]);
    }
    
    function hasVotedInElection(uint256 electionId, address voter) external view returns (bool) {
        return hasVoted[electionId][voter];
    }
    
    function getElectionStatus(uint256 electionId) external view returns (string memory) {
        if (!elections[electionId].exists) return "invalid";
        if (block.timestamp < elections[electionId].startDate) return "upcoming";
        if (block.timestamp > elections[electionId].endDate) return "completed";
        return "active";
    }
    
    function getTotalVotesForElection(uint256 electionId) external view returns (uint256) {
        uint256 total = 0;
        uint256[] memory candidateIds = electionCandidates[electionId];
        for (uint256 i = 0; i < candidateIds.length; i++) {
            total += candidateVotes[candidateIds[i]];
        }
        return total;
    }
}
