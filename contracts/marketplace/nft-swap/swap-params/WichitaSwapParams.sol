pragma solidity 0.6.7;
pragma experimental ABIEncoderV2;

import "./../SwapSigner.sol";

/// @title WichitaSwapParams is nft params encoder/decoder, signature verifyer
/// @author Nejc Schneider
contract WichitaSwapParams {
    SwapSigner private swapSigner;

    constructor(address _signerAddress) public {
        swapSigner = SwapSigner(_signerAddress);
    }

    function paramsAreValid (uint256 _offerId, bytes memory _encodedData,
      uint8 v, bytes32 r, bytes32 s) public view returns (bool){

      uint8 quality = decodeParams(_encodedData);

      bytes32 hash = this.encodeParams(_offerId, quality);

      address recover = ecrecover(hash, v, r, s);
      require(recover == swapSigner.getSigner(),  "Verification failed");

    	return true;
    }

    function encodeParams(
        uint256 _offerId,
        uint8 _quality
    )
        public
        view
        returns (bytes32 message)
    {
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 messageNoPrefix = keccak256(abi
            .encode(_offerId, _quality));
        bytes32 hash = keccak256(abi.encodePacked(prefix, messageNoPrefix));

        return hash;
    }

    function decodeParams (bytes memory _encodedData)
        public
        view
        returns (
            uint8
        )
    {
        uint8 quality = abi.decode(_encodedData, (uint8));

        return quality;
    }

}
