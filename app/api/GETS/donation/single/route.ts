// Import necessary modules and models
import { closeConnection, connectDatabase } from "@/Models";
import { DonationModel, donationProps } from "@/Models/donation";
import { HTTP_STATUS } from "@/app/api/donation/withdraw/route";
import { NextRequest, NextResponse } from "next/server";

// Define a GET handler for retrieving donation information
export const GET = async (req: NextRequest) => {
  // Extract the 'id' parameter from the request URL
  const id = req.nextUrl.searchParams.get("id");

  // Check if 'id' parameter is missing
  if (!id) {
    return new Response(null, {
      status: 404,
      statusText: "Missing required parameter",
    });
  }

  // Connect to the database
  await connectDatabase();

  try {
    // Find the donation by ID in the database
    const donation: donationProps | null = await DonationModel.findById(id);

    // Check if the donation is not found
    if (!donation) {
      // Close the database connection and return a response indicating that the donation is not found
      await closeConnection();
      return new Response(null, {
        status: HTTP_STATUS.NOT_FOUND,
        statusText: "Donation not found",
      });
    }

    // Close the database connection and return a JSON response with the donation information
    await closeConnection();
    return NextResponse.json({ donation: donation });
  } catch (error) {
    // Log any errors that occur during the database operation
    console.log(error);

    // Close the database connection and return a response indicating a server error
    await closeConnection();
    return new Response(null, {
      status: HTTP_STATUS.SERVER_ERROR,
      statusText: "Internal Server Error",
    });
  }
};
