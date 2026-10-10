"use client";

import { useEffect, useState } from "react";

// Campaigns page
// Ye page campaigns ko create, show, delete aur QR generate karega
export default function Campaigns() {

  // Campaigns ki list store karne ke liye
  const [campaigns, setCampaigns] = useState([]);

  // Loading status ke liye
  const [loading, setLoading] = useState(true);

  // Error message ke liye
  const [error, setError] = useState("");

  // Form open/close karne ke liye
  const [showForm, setShowForm] = useState(false);

  // Campaign name
  const [name, setName] = useState("");

  // Campaign description
  const [description, setDescription] = useState("");

  // Campaign target URL
  const [targetUrl, setTargetUrl] = useState("");

  // Campaign create karte waqt loading
  const [creating, setCreating] = useState(false);

  // Success message
  const [success, setSuccess] = useState("");

  // Edit campaign ke liye
  const [showEditForm, setShowEditForm] = useState(false);
  const [editId, setEditId] = useState("");
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTargetUrl, setEditTargetUrl] = useState("");
  const [editStatus, setEditStatus] = useState("active");

  // Update loading ke liye
  const [updating, setUpdating] = useState(false);

  // Campaign details popup ke liye
  const [selectedCampaign, setSelectedCampaign] = useState(null);

  
  // Campaign search aur status filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");


  // =========================
  // FETCH CAMPAIGNS
  // =========================

  useEffect(() => {
    fetchCampaigns();
  }, []);


  // Backend se campaigns fetch karna
  const fetchCampaigns = async () => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
      window.location.replace("/login");
      return;
      }

      const response = await fetch(
       "https://smart-qr-marketing-platform.onrender.com/api/campaigns",
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {

        setCampaigns(data.campaigns);

      } else {

        setError(
          data.message || "Campaigns fetch nahi ho payi."
        );
      }

    } catch (error) {

      console.error("Fetch Campaigns Error:", error);

      setError("Server se connection nahi ho raha.");

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // CREATE CAMPAIGN
  // =========================

  const handleCreateCampaign = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");

    try {

      setCreating(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        "https://smart-qr-marketing-platform.onrender.com/api/campaigns",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            name,
            description,
            targetUrl,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {

        setSuccess("Campaign created successfully!");

        setName("");
        setDescription("");
        setTargetUrl("");

        setShowForm(false);

        fetchCampaigns();

      } else {

        setError(
          data.message || "Campaign create nahi ho payi."
        );
      }

    } catch (error) {

      console.error("Create Campaign Error:", error);

      setError("Server se connection nahi ho raha.");

    } finally {

      setCreating(false);

    }
  };


  
  // =========================
  // EDIT CAMPAIGN
  // =========================

  const handleEditCampaign = (campaign) => {
    setEditId(campaign._id);
    setEditName(campaign.name);
    setEditDescription(campaign.description || "");
    setEditTargetUrl(campaign.targetUrl);
    setEditStatus(campaign.status || "active");

    setShowEditForm(true);
    setShowForm(false);
    setError("");
    setSuccess("");
  };

  // =========================
  // UPDATE CAMPAIGN
  // =========================

  const handleUpdateCampaign = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    try {
      setUpdating(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `https://smart-qr-marketing-platform.onrender.com/api/campaigns/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: editName,
            description: editDescription,
            targetUrl: editTargetUrl,
            status: editStatus,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess("Campaign updated successfully!");
        setShowEditForm(false);
        await fetchCampaigns();
      } else {
        setError(data.message || "Campaign update nahi ho payi.");
      }
    } catch (error) {
      console.error("Update Campaign Error:", error);
      setError("Server se connection nahi ho raha.");
    } finally {
      setUpdating(false);
    }
  };


  // =========================
  // GENERATE QR CODE
  // =========================

  const handleGenerateQR = async (campaignId) => {

    try {

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Please login first.");
        return;
      }

      const response = await fetch(
        `https://smart-qr-marketing-platform.onrender.com/api/campaigns/${campaignId}/qr`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {

        setSuccess("QR Code generated successfully!");

        fetchCampaigns();

      } else {

        setError(
          data.message || "QR Code generate nahi ho paya."
        );
      }

    } catch (error) {

      console.error("Generate QR Error:", error);

      setError("Server se connection nahi ho raha.");

    }
  };


  // =========================
  // DELETE CAMPAIGN
  // =========================

  const handleDeleteCampaign = async (campaignId) => {

    // Delete karne se pehle confirmation
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this campaign?"
    );

    // Agar user Cancel kare
    if (!confirmDelete) {
      return;
    }

    try {

      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      // Token nahi hai
      if (!token) {
        setError("Please login first.");
        return;
      }

      // Backend Delete API
      const response = await fetch(
       `https://smart-qr-marketing-platform.onrender.com/api/campaigns/${campaignId}`,
        {
          method: "DELETE",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      // Delete successful
      if (response.ok) {

        setSuccess("Campaign deleted successfully!");

        // Campaign list refresh
        fetchCampaigns();

      } else {

        setError(
          data.message || "Campaign delete nahi ho payi."
        );
      }

    } catch (error) {

      console.error("Delete Campaign Error:", error);

      setError("Server se connection nahi ho raha.");

    }
  };


  return (
    <main className="min-h-screen bg-gray-100 p-8">
        
      {/* CAMPAIGN DETAILS POPUP */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Campaign Details
              </h2>

              <button
                type="button"
                onClick={() => setSelectedCampaign(null)}
                className="rounded-lg px-3 py-1 text-xl text-gray-500 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Campaign Name</p>
                <p className="font-semibold text-gray-900">
                  {selectedCampaign.name}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-gray-800">
                  {selectedCampaign.description || "No description"}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Target URL</p>
                <a
                  href={selectedCampaign.targetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-blue-600 underline"
                >
                  {selectedCampaign.targetUrl}
                </a>
              </div>

              <div>
                <p className="text-sm text-gray-500">Status</p>
                <span
                  className={`inline-block rounded-full px-3 py-1 text-sm ${
                    selectedCampaign.status === "active"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {selectedCampaign.status}
                </span>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total Scans</p>
                <p className="font-semibold text-gray-900">
                  {selectedCampaign.scanCount ?? 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Created Date</p>
                <p className="text-gray-800">
                  {selectedCampaign.createdAt
                    ? new Date(selectedCampaign.createdAt).toLocaleDateString()
                    : "Not available"}
                </p>
              </div>

              {selectedCampaign.qrCode && (
                <div className="pt-2 text-center">
                  <p className="mb-2 text-sm text-gray-500">QR Code</p>
                  <img
                    src={selectedCampaign.qrCode}
                    alt="Campaign QR Code"
                    className="mx-auto h-40 w-40 rounded-lg border p-2"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSelectedCampaign(null)}
              className="mt-6 w-full rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* =========================
          PAGE HEADER
          ========================= */}

      <div className="mb-8 flex items-center justify-between">

        <div>

          <h1 className="text-3xl font-bold text-gray-900">
            Campaigns
          </h1>

          <p className="mt-2 text-gray-600">
            Create and manage your QR marketing campaigns.
          </p>

        </div>


        {/* Create Campaign Button */}

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-lg bg-black px-5 py-3 font-medium text-white hover:bg-gray-800"
        >
          {showForm
            ? "Close Form"
            : "+ Create Campaign"}
        </button>

      </div>


      {/* =========================
          SUCCESS MESSAGE
          ========================= */}

      {success && (
        <div className="mb-6 rounded-lg bg-green-100 p-4 text-green-700">
          {success}
        </div>
      )}


      {/* =========================
          ERROR MESSAGE
          ========================= */}

      {error && (
        <div className="mb-6 rounded-lg bg-red-100 p-4 text-red-700">
          {error}
        </div>
      )}


      {/* =========================
          CREATE CAMPAIGN FORM
          ========================= */}

      {showForm && (

        <section className="mb-8 rounded-xl bg-white p-8 shadow">

          <h2 className="text-2xl font-semibold text-gray-900">
            Create New Campaign
          </h2>

          <p className="mt-2 text-gray-600">
            Enter your campaign details below.
          </p>


          <form
            onSubmit={handleCreateCampaign}
            className="mt-6 space-y-5"
          >

            {/* Campaign Name */}

            <div>

              <label className="mb-2 block font-medium text-gray-700">
                Campaign Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Example: Summer Sale"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

            </div>


            {/* Description */}

            <div>

              <label className="mb-2 block font-medium text-gray-700">
                Description
              </label>

              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                placeholder="Enter campaign description"
                rows="4"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

            </div>


            {/* Target URL */}

            <div>

              <label className="mb-2 block font-medium text-gray-700">
                Target URL
              </label>

              <input
                type="url"
                value={targetUrl}
                onChange={(event) =>
                  setTargetUrl(event.target.value)
                }
                placeholder="https://example.com"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
              />

            </div>


            {/* Submit Button */}

            <button
              type="submit"
              disabled={creating}
              className="rounded-lg bg-black px-6 py-3 font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating
                ? "Creating..."
                : "Create Campaign"}
            </button>

          </form>

        </section>

      )}

      
      {/* EDIT CAMPAIGN FORM */}
      {showEditForm && (
        <section className="mb-8 rounded-xl bg-white p-8 shadow">
          <h2 className="text-2xl font-semibold text-gray-900">
            Edit Campaign
          </h2>

          <form
            onSubmit={handleUpdateCampaign}
            className="mt-6 space-y-5"
          >
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Campaign Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(event) => setEditName(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(event) => setEditDescription(event.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Target URL
              </label>
              <input
                type="url"
                value={editTargetUrl}
                onChange={(event) => setEditTargetUrl(event.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(event) => setEditStatus(event.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {updating ? "Updating..." : "Update Campaign"}
              </button>

              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="rounded-lg border px-6 py-3 hover:bg-gray-100"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}


      {/* =========================
          LOADING
          ========================= */}

      {loading && (
        <p className="text-gray-600">
          Loading campaigns...
        </p>
      )}


      {/* =========================
          CAMPAIGN LIST
          ========================= */}
        
        {/* SEARCH AND STATUS FILTER */}
        {!loading && campaigns.length > 0 && (
          <div className="mb-6 flex flex-col gap-4 rounded-xl bg-white p-5 shadow sm:flex-row">
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search campaign by name..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black"
            />

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-black sm:w-52"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        )}

        {!loading && (
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {campaigns.length === 0 ? (

            <div className="rounded-xl bg-white p-8 shadow">

              <h2 className="text-xl font-semibold text-gray-900">
                No Campaigns Yet
              </h2>

              <p className="mt-2 text-gray-600">
                Create your first QR marketing campaign.
              </p>

            </div>

          ) : (

    campaigns
            
     .filter((campaign) => {
      const matchesName = campaign.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

      const matchesStatus =
      statusFilter === "all" || campaign.status === statusFilter;

    return matchesName && matchesStatus;
  })
  .map((campaign) => (

              <div
                key={campaign._id}
                className="rounded-xl bg-white p-6 shadow"
              >

                {/* Campaign Name + Status */}

                <div className="flex items-center justify-between">

                  <h2 className="text-xl font-semibold text-gray-900">
                    {campaign.name}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-sm ${
                      campaign.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {campaign.status}
                  </span>

                </div>


                {/* Description */}

                <p className="mt-3 text-gray-600">
                  {campaign.description ||
                    "No description"}
                </p>


                {/* Campaign Information */}

                <div className="mt-6 flex justify-between">

                  <div>

                    <p className="text-sm text-gray-500">
                      Scans
                    </p>

                    <p className="text-xl font-bold">
                      {campaign.scanCount}
                    </p>

                  </div>


                  <div>

                    <p className="text-sm text-gray-500">
                      Created
                    </p>

                    <p className="text-sm font-medium">
                      {new Date(
                        campaign.createdAt
                      ).toLocaleDateString()}
                    </p>

                  </div>

                </div>


              
        {/* =========================
             QR CODE IMAGE + DOWNLOAD
             ========================= */}

        {campaign.qrCode && (
            <div className="mt-6 flex flex-col items-center gap-3">

             <img
               src={campaign.qrCode}
               alt={`${campaign.name} QR Code`}
               className="h-40 w-40 rounded-lg border p-2"
             />

             <a
               href={campaign.qrCode}
               download={`${campaign.name.replace(/\s+/g, "-")}-QR.png`}
               className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
             >
               Download QR Code
             </a>

            </div>
        )}

                {/* =========================
                    BUTTONS
                    ========================= */}

                <div className="mt-6 flex flex-wrap gap-3">

                  {/* View Button */}
                  <button
                    type="button"
                    onClick={() => setSelectedCampaign(campaign)}
                    className="rounded-lg border px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    View
                  </button>

                  
                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => handleEditCampaign(campaign)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >
                    Edit
                  </button>

                  {/* QR Code Button */}

                  <button
                    onClick={() =>
                      handleGenerateQR(campaign._id)
                    }
                    className="rounded-lg bg-black px-4 py-2 text-sm text-white hover:bg-gray-800"
                  >
                    QR Code
                  </button>


                  {/* Test Scan Button */}

                  <a
                    href={`https://smart-qr-marketing-platform.onrender.com/api/scans/${campaign._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                  >
                    Test Scan
                  </a>


                  {/* Delete Button */}

                  <button
                    onClick={() =>
                      handleDeleteCampaign(campaign._id)
                    }
                    className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))

          )}

        </section>

      )}

    </main>
  );
}