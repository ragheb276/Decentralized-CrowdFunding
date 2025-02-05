import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ethereum, loader, withdraw } from '../assets'
import { useStateContext } from '../context'
import {
  CountBox,
  CustomButton,
  Loader,
  MetMaskButton,
  UserRewards
} from '../components'
import { useFetch } from '../hooks'
import { JoiValidate, calculatePercentage, formatError } from '../utils'
import { toast } from 'react-toastify'
import { parseEther } from 'ethers/lib/utils'
import { campaignIdSchema, donationAmountSchema } from '../validators/campaigns'

const CampaignDetails = () => {
  const { id } = useParams()
  const { campaignContract, signer, address, connect } = useStateContext()

  const [isLoading, setIsLoading] = useState(false)
  const [amount, setAmount] = useState('')
  // const [userDonation, setUserDonation] = useState('')
  const [editMode, setEditMode] = useState(false)

  const {
    data: campaign,
    loading: iscampaignLoading,
    error: campaignError,
    reFetch
  } = useFetch(`http://localhost:8080/api/v1/campaigns/${id}`)
  // console.log(campaign)

  const userDonation = useFetch(
    `http://localhost:8080/api/v1/campaigns/donations/${id}/${address}`,
    null,
    [address]
  )

  const unWithdrawnAmount =
    campaign?.amountCollected - campaign?.withdrawnAmount
  const barPercentage = calculatePercentage(
    campaign?.target,
    campaign?.amountCollected
  )

  const softcapPercentage = calculatePercentage(
    campaign?.target,
    campaign?.softcap
  )

  const handleDonate = async () => {
    if (campaign?.owner === address) return
    setIsLoading(true)
    try {
      const { campaignId } = JoiValidate(campaignIdSchema, {
        campaignId: campaign?.pId
      })

      const { donationAmount } = JoiValidate(donationAmountSchema, {
        donationAmount: amount
      })
      await campaignContract.connect(signer).fundInEth(campaignId, {
        value: parseEther(donationAmount?.toString())
      })
      reFetch()
      toast.success('Funded!')
    } catch (error) {
      toast.error(formatError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (campaign?.owner !== address) return
    setIsLoading(true)
    try {
      const { campaignId } = JoiValidate(campaignIdSchema, {
        campaignId: campaign?.pId
      })
      await campaignContract.connect(signer).withdrawFunds(campaignId)
      reFetch()
      toast.success('Funds withdrawn successfully!')
    } catch (error) {
      toast.error(formatError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = async () => {
    if (campaign?.owner !== address) return
    setIsLoading(true)
    try {
      const { campaignId } = JoiValidate(campaignIdSchema, {
        campaignId: campaign?.pId
      })
      await campaignContract.connect(signer).closeCampaign(campaignId)
      reFetch()
      toast.success('Campaign closed!')
    } catch (error) {
      toast.error(formatError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefund = async () => {
    if (campaign?.owner === address) return
    setIsLoading(true)
    try {
      const { campaignId } = JoiValidate(campaignIdSchema, {
        campaignId: campaign?.pId
      })
      await campaignContract.connect(signer).refund(campaignId)
      userDonation.reFetch()
      toast.success('Refunded!')
    } catch (error) {
      toast.error(formatError(error))
    } finally {
      setIsLoading(false)
    }
  }

  const closeSvg = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        width="100%"
        height="100%"
        viewBox="0 0 24 24"
        stroke="currentColor"
        className="w-6 h-6 mr-1"
      >
        <path d="M12,23A11,11,0,1,0,1,12,11.013,11.013,0,0,0,12,23ZM12,3a9,9,0,1,1-9,9A9.01,9.01,0,0,1,12,3ZM8.293,14.293,10.586,12,8.293,9.707A1,1,0,0,1,9.707,8.293L12,10.586l2.293-2.293a1,1,0,0,1,1.414,1.414L13.414,12l2.293,2.293a1,1,0,1,1-1.414,1.414L12,13.414,9.707,15.707a1,1,0,0,1-1.414-1.414Z" />
      </svg>
    )
  }

  const saveSvg = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 mr-1 feather feather-save"
      >
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
    )
  }

  const withdrawSvg = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
        width="100%"
        height="100%"
        viewBox="0 0 256 256"
        xmlSpace="preserve"
        stroke="currentColor"
        strokeWidth="2"
        fill="currentColor"
        className="w-7 h-7"
      >
        <defs></defs>
        <g
          style={{
            stroke: 'none',
            strokeWidth: 3,
            strokeDasharray: 'none',
            strokeLinecap: 'butt',
            strokeLinejoin: 'miter',
            strokeMiterlimit: 10,
            fill: 'currentColor',
            fillRule: 'nonzero',
            opacity: 1
          }}
          transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
        >
          <path
            d="M 83.806 19.987 H 6.195 C 2.779 19.987 0 22.766 0 26.181 v 12.163 c 0 3.416 2.779 6.195 6.195 6.195 h 17.974 V 64.32 c 0 3.14 2.554 5.693 5.693 5.693 h 30.85 c 3.14 0 5.693 -2.554 5.693 -5.693 V 44.539 h 17.4 c 3.416 0 6.194 -2.779 6.194 -6.195 V 26.181 C 90 22.766 87.222 19.987 83.806 19.987 z M 62.405 64.32 c 0 0.934 -0.76 1.693 -1.693 1.693 h -30.85 c -0.934 0 -1.693 -0.76 -1.693 -1.693 V 34.263 h 34.236 V 64.32 z M 86 38.344 c 0 1.21 -0.984 2.195 -2.194 2.195 h -17.4 v -6.276 h 11.239 c 1.104 0 2 -0.896 2 -2 s -0.896 -2 -2 -2 H 64.405 H 26.169 H 12.93 c -1.104 0 -2 0.896 -2 2 s 0.896 2 2 2 h 11.239 v 6.276 H 6.195 C 4.984 40.539 4 39.554 4 38.344 V 26.181 c 0 -1.21 0.984 -2.194 2.195 -2.194 h 77.611 c 1.21 0 2.194 0.984 2.194 2.194 V 38.344 z"
            style={{
              stroke: 'currentColor',
              strokeWidth: 2,
              strokeDasharray: 'none',
              strokeLinecap: 'butt',
              strokeLinejoin: 'miter',
              strokeMiterlimit: 10,
              fill: 'currentColor',
              fillRule: 'nonzero',
              opacity: 1
            }}
            transform="matrix(1 0 0 1 0 0)"
            strokeLinecap="round"
          />
          <path
            d="M 51.112 49.938 L 47 54.049 V 41.022 c 0 -1.104 -0.896 -2 -2 -2 s -2 0.896 -2 2 v 13.027 l -4.112 -4.112 c -0.781 -0.781 -2.048 -0.781 -2.828 0 c -0.781 0.781 -0.781 2.048 0 2.828 l 7.525 7.524 c 0.093 0.094 0.196 0.177 0.307 0.251 c 0.048 0.032 0.099 0.053 0.148 0.081 c 0.065 0.036 0.127 0.075 0.196 0.103 c 0.065 0.027 0.133 0.042 0.2 0.062 c 0.058 0.017 0.113 0.039 0.173 0.051 c 0.129 0.026 0.26 0.039 0.392 0.039 s 0.262 -0.014 0.392 -0.039 c 0.06 -0.012 0.115 -0.034 0.173 -0.051 c 0.067 -0.02 0.135 -0.035 0.2 -0.062 c 0.069 -0.028 0.131 -0.067 0.196 -0.103 c 0.049 -0.027 0.101 -0.049 0.148 -0.081 c 0.11 -0.074 0.213 -0.157 0.307 -0.251 l 7.525 -7.524 c 0.781 -0.78 0.781 -2.047 0 -2.828 S 51.894 49.156 51.112 49.938 z"
            style={{
              stroke: 'currentColor',
              strokeWidth: 2,
              strokeDasharray: 'none',
              strokeLinecap: 'butt',
              strokeLinejoin: 'miter',
              strokeMiterlimit: 10,
              fill: 'none',
              fillRule: 'nonzero',
              opacity: 1
            }}
            transform="matrix(1 0 0 1 0 0)"
            strokeLinecap="round"
          />
        </g>
      </svg>
    )
  }

  const editSvg = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 mr-1 feather feather-edit"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
      </svg>
    )
  }

  const refundSvg = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        width="100%"
        height="100%"
        stroke="currentColor"
        strokeWidth="6"
        version="1.1"
        id="Layer_1"
        viewBox="0 0 512 512"
        className=" h-7 w-7"
      >
        <g>
          <g>
            <path d="M490.175,215.984c-7.815-47.427-29.172-91.284-61.76-126.832c-33.393-36.427-76.56-61.724-124.835-73.158    c-64.109-15.182-130.292-4.492-186.358,30.104C61.156,80.692,21.917,135.05,6.733,199.157    C-8.45,263.264,2.241,329.448,36.835,385.515c34.595,56.066,88.952,95.306,153.06,110.49c19.028,4.506,38.229,6.734,57.304,6.732    c45.191-0.001,89.629-12.508,129.054-36.835c4.021-2.481,5.269-7.752,2.788-11.773c-2.481-4.02-7.751-5.27-11.774-2.788    c-52.178,32.194-113.767,42.143-173.429,28.014C70.68,450.186-5.785,326.258,23.384,203.102    C52.553,79.943,176.481,3.478,299.637,32.647c44.926,10.641,85.095,34.178,116.165,68.069    c30.336,33.092,50.216,73.913,57.489,118.051c0.768,4.663,5.178,7.817,9.833,7.051    C487.786,225.048,490.943,220.646,490.175,215.984z" />
          </g>
        </g>
        <g>
          <g>
            <path d="M511.64,308.302c-0.877-2.927-3.25-5.165-6.224-5.87l-15.756-3.731c2.877-16.3,4.117-32.838,3.689-49.277    c-0.122-4.724-4.043-8.439-8.774-8.331c-4.724,0.123-8.453,4.052-8.331,8.774c0.465,17.869-1.189,35.868-4.915,53.495    c-0.961,4.544,1.879,9.024,6.398,10.094l9.325,2.21l-44.886,47.592l-18.773-62.669l9.158,2.169    c2.252,0.536,4.622,0.133,6.574-1.112c1.95-1.245,3.314-3.226,3.779-5.493c10.498-51.149,0.811-103.611-27.276-147.723    c-28.146-44.205-71.737-75.203-122.744-87.284c-107.442-25.445-215.552,41.263-241,148.705    c-7.985,33.717-7.104,69.02,2.548,102.093c9.358,32.061,26.749,61.546,50.293,85.268c1.672,1.685,3.873,2.528,6.072,2.528    c2.179,0,4.359-0.827,6.028-2.483c3.353-3.329,3.374-8.746,0.046-12.1c-44.953-45.29-63.024-109.35-48.337-171.362    C91.808,115.533,190.683,54.528,288.943,77.798c46.647,11.049,86.512,39.397,112.254,79.824    c24.099,37.849,33.388,82.418,26.517,126.406l-14.794-3.503c-2.975-0.707-6.098,0.232-8.196,2.455s-2.849,5.397-1.972,8.325    l27.277,91.059c0.877,2.927,3.25,5.165,6.224,5.87c2.973,0.705,6.098-0.232,8.196-2.455l65.221-69.151    C511.765,314.404,512.517,311.23,511.64,308.302z" />
          </g>
        </g>
        <g>
          <g>
            <path d="M354.675,414.64c-2.481-4.021-7.751-5.269-11.773-2.788c-41.629,25.687-90.768,33.626-138.369,22.35    c-23.864-5.651-45.925-15.773-65.573-30.083c-3.82-2.782-9.171-1.939-11.952,1.879c-2.781,3.819-1.94,9.171,1.879,11.952    c21.493,15.654,45.618,26.724,71.703,32.902c15.448,3.659,31.037,5.466,46.523,5.466c36.689,0,72.766-10.155,104.775-29.905    C355.908,423.932,357.156,418.661,354.675,414.64z" />
          </g>
        </g>
        <g>
          <g>
            <path d="M284.017,247.413h-75.412c-5.797,0-10.513-4.716-10.513-10.513v-30.717c0-5.797,4.716-10.513,10.513-10.513h94.48    c4.725,0,8.555-3.831,8.555-8.555s-3.831-8.555-8.555-8.555h-48.219v-30.79c0-4.725-3.831-8.555-8.555-8.555    s-8.555,3.831-8.555,8.555v30.79h-29.15c-15.232,0-27.624,12.392-27.624,27.624V236.9c0,15.232,12.392,27.624,27.624,27.624    h75.412c5.797,0,10.513,4.716,10.513,10.513v30.717c-0.001,5.796-4.717,10.513-10.514,10.513h-94.48    c-4.725,0-8.555,3.831-8.555,8.555s3.831,8.555,8.555,8.555h48.219v30.79c0,4.725,3.831,8.555,8.555,8.555    s8.555-3.831,8.555-8.555v-30.79h29.151c15.232,0,27.624-12.392,27.624-27.624v-30.717    C311.641,259.805,299.249,247.413,284.017,247.413z" />
          </g>
        </g>
      </svg>
    )
  }

  return (
    <div>
      {isLoading && <Loader />}
      <div className="w-full flex md:flex-row flex-col mt-10 gap-[30px]">
        <div className="flex-col flex-1">
          {campaign ? (
            <img
              src={campaign?.image}
              alt="campaign"
              className="w-full h-[410px] object-cover rounded-xl"
            />
          ) : (
            <img
              src={loader}
              alt="loader"
              className="w-[100px] h-[100px] object-contain mx-auto"
            />
          )}
          <div className="relative w-full mt-2 mb-3 bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className={`${
                campaign?.status === 'Open' ? 'bg-[#23be73]' : 'bg-[#c70039]'
              } text-xl font-medium text-white text-center p-0.5 leading-none rounded-full`}
              style={{ width: barPercentage <= 100 && barPercentage + '%' }}
            >
              {barPercentage}%
            </div>
            <div
              className="absolute top-0 w-1 h-full bg-dark dark:bg-gray-300"
              style={{ left: softcapPercentage + '%' }}
            ></div>
            <p
              className="absolute text-sm top-6 dark:text-light"
              style={{ left: 'calc(' + softcapPercentage + '% - 25px)' }}
            >
              Softcap ({softcapPercentage}%)
            </p>
          </div>
        </div>
        <div className="flex md:w-[150px] w-full flex-wrap justify-between gap-[15px]">
          <CountBox
            title="Status"
            value={campaign?.status}
            styles={{
              text: campaign?.status === 'Open' ? '[#1dc071]' : '[#c70039]'
            }}
          />
          <CountBox
            title={`Raised of ${campaign?.target}`}
            value={campaign?.amountCollected}
          />
          <CountBox title="Total Funds" value={campaign?.donations?.length} />
        </div>
      </div>
      <div className="flex gap-2 mt-6 flex-wrap">
        {campaign?.owner !== address ? (
          <button
            onClick={handleRefund}
            className={`flex items-center justify-center gap-1 px-2 py-1 text-sm font-bold text-green-700 transition duration-200 ease-in-out bg-green-100 border border-green-600 rounded cursor-pointer hover:scale-105 focus:outline-none hover:bg-green-700 hover:text-green-100
          ${
            (userDonation?.data > 0 ||
              campaign?.softcap > campaign?.amountCollected) &&
            'grayscale pointer-events-none cursor-not-allowed'
          }`}
          >
            <div className="flex leading-5">{refundSvg()}</div>
            Refund ({userDonation.data}$)
          </button>
        ) : (
          <>
            <button
              onClick={handleWithdraw}
              className={`flex items-center justify-center gap-1 px-2 py-1 text-sm font-bold text-green-700 transition duration-200 ease-in-out bg-green-100 border border-green-600 rounded cursor-pointer hover:scale-105 focus:outline-none hover:bg-green-700 hover:text-green-100
              ${
                (unWithdrawnAmount > 0 ||
                  campaign?.softcap < campaign?.amountCollected) &&
                'grayscale pointer-events-none cursor-not-allowed'
              }`}
            >
              <div className="flex mt-1 leading-5">{withdrawSvg()}</div>
              Withdraw ({unWithdrawnAmount}
              $)
            </button>
            {campaign?.status === 'Open' && (
              <>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex justify-center px-4 py-2 text-base font-bold text-green-700 transition duration-200 ease-in-out bg-green-100 border border-green-600 rounded cursor-pointer hover:scale-105 focus:outline-none hover:bg-green-700 hover:text-green-100 ${
                    !editMode && 'hidden'
                  }`}
                >
                  <div className="flex leading-5">
                    {saveSvg()}
                    Save
                  </div>
                </button>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className={`flex justify-center px-4 py-2 text-base font-bold text-green-700 transition duration-200 ease-in-out bg-green-100 border border-green-600 rounded cursor-pointer hover:scale-105 focus:outline-none hover:bg-green-700 hover:text-green-100 ${
                    editMode && 'hidden'
                  }`}
                >
                  <div className="flex leading-5">
                    {editSvg()}
                    Edit
                  </div>
                </button>
                <button
                  onClick={handleClose}
                  className="flex items-center justify-center gap-1 px-4 py-2 text-sm font-bold text-red-700 transition duration-200 ease-in-out bg-red-100 border border-red-600 rounded cursor-pointer hover:scale-105 focus:outline-none hover:bg-red-700 hover:text-red-100"
                >
                  <div className="flex leading-5">{closeSvg()}</div>
                  Close
                </button>
              </>
            )}
          </>
        )}
      </div>

      <div className="mt-[23px] flex lg:flex-row flex-col gap-5">
        <div className="flex-[2] flex flex-col gap-[40px]">
          <div>
            <h4 className="font-epilogue font-semibold text-[18px] dark:text-white uppercase mb-3">
              Creator
            </h4>
            <div className="flex gap-2">
              <div className="w-[40px] h-[40px] flex items-center justify-center rounded-full bg-light dark:bg-[#2c2f32]">
                <img
                  src={ethereum}
                  alt="user"
                  className="w-[70%] h-[70%] object-contain"
                />
              </div>
              <div className="flex flex-row items-center truncate">
                <h4 className="font-epilogue font-bold text-[15px] dark:text-white">
                  {campaign?.owner}
                </h4>
                <UserRewards address={campaign?.owner} />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] dark:text-white uppercase">
              Story
            </h4>

            <div className="mt-[20px]">
              <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify break-all">
                {campaign?.description}
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-epilogue font-semibold text-[18px] dark:text-white uppercase">
              Funds
            </h4>

            <div className="mt-[10px] flex flex-col gap-4">
              {campaign?.donations && campaign?.donations?.length > 0 ? (
                campaign?.donations?.map((item, index) => (
                  <div
                    key={`${item.funder}-${index}`}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex flex-wrap items-center justify-between">
                      <p className="font-epilogue font-bold text-[15px] dark:text-white leading-[26px] break-all">
                        {item.funder}
                      </p>
                      <UserRewards address={item.funder} />
                    </div>
                    <p className="font-epilogue text-[16px] font-bold dark:text-white leading-[26px]">
                      {item.fundedAmount}$
                    </p>
                  </div>
                ))
              ) : (
                <p className="font-epilogue font-normal text-[16px] text-[#808191] leading-[26px] text-justify">
                  No donators yet. Be the first!
                </p>
              )}
            </div>
          </div>
        </div>
        {campaign?.owner !== address && campaign?.status === 'Open' && (
          <div className="flex-1">
            <h4 className="font-epilogue font-semibold text-[18px] dark:text-white uppercase">
              Fund
            </h4>

            <div className="mt-[20px] flex flex-col p-6 bg-light dark:bg-[#1c1c24] rounded-[10px]">
              <p className="font-epilogue fount-medium text-[20px] leading-[30px] text-center dark:text-[#808191]">
                Fund this campaign
              </p>
              <div className="mt-[30px]">
                <input
                  type="number"
                  pattern="[0-9]+"
                  placeholder="ETH 0.1"
                  step="0.01"
                  className="w-full py-[10px] sm:px-[20px] px-[15px] outline-none border-[1px] border-[#3a3a43] bg-transparent font-epilogue dark:text-white text-[18px] leading-[30px] placeholder:text-[#4b5264] rounded-[10px]"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />

                <div className="my-[10px] p-4 bg-gray-300 dark:bg-[#13131a] rounded-[10px]">
                  <h4 className="font-epilogue font-semibold text-[14px] leading-[22px] dark:text-white">
                    Thanks Notation:
                  </h4>
                  <p className="mt-[20px] font-epilogue font-normal leading-[22px] text-[#808191]">
                    {campaign?.message}
                  </p>
                </div>

                {address ? (
                  <button
                    type="button"
                    onClick={handleDonate}
                    className="w-full hover:scale-105 text-gray-900 bg-gray-100 dark:bg-gray-800 dark:text-white focus:ring-4 focus:outline-none focus:ring-gray-100 font-bold rounded-lg text-md px-5 py-2.5 text-center justify-center inline-flex items-center dark:focus:ring-gray-500 "
                  >
                    <svg
                      className="w-8 h-8 mr-2 ml-1 text-[#626890] dark:text-white"
                      aria-hidden="true"
                      focusable="false"
                      data-prefix="fab"
                      data-icon="ethereum"
                      role="img"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 320 512"
                    >
                      <path
                        fill="currentColor"
                        d="M311.9 260.8L160 353.6 8 260.8 160 0l151.9 260.8zM160 383.4L8 290.6 160 512l152-221.4-152 92.8z"
                      ></path>
                    </svg>
                    Fund in Ethereum
                  </button>
                ) : (
                  <MetMaskButton />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CampaignDetails
