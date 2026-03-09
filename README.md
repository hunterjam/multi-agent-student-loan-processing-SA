# Multi-agent student loan processing solution accelerator

This solution accelerator is a conversational AI assistant for student loan processing that leverages multi-agent architecture to handle loan applications through natural conversation. Built on the Microsoft Agent Framework, it uses specialized AI agents to extract document data, validate applications, and make automated loan approval decisions.
<br/>

<div align="center">

[**SOLUTION OVERVIEW**](#-solution-overview)  \| [**QUICK DEPLOY**](#-quick-deploy)  \| [**BUSINESS SCENARIO**](#-business-scenario)  \| [**SUPPORTING DOCUMENTATION**](#-supporting-documentation)

</div>
<br/>

**Note:** With any AI solutions you create using these templates, you are responsible for assessing all associated risks and for complying with all applicable laws and safety standards. Learn more in the transparency documents for [Agent Service](https://learn.microsoft.com/en-us/azure/ai-foundry/responsible-ai/agents/transparency-note) and [Agent Framework](https://github.com/microsoft/agent-framework/blob/main/TRANSPARENCY_FAQ.md).
<br/>

<h2><img src="./docs/images/readme/solution-overview.png" width="64" />
Solution overview
</h2>

This solution leverages Azure OpenAI Service, Azure Blob Storage, and Azure Container Apps to process student loan applications through natural conversation. Users can ask questions, upload documents, and receive automated loan decisions without navigating traditional web forms.

The sample data includes synthetic loan applications and bank statements. The data is intended for use as sample data only.

### Solution architecture

|![Solution Architecture](./media/ArchitectureDiagrm.png)|
|---|

<br/>

### Additional resources

[Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/)

[Microsoft Agent Framework](https://github.com/microsoft/agent-framework)

[Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/)

[Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/)

<br/>

### Key features
<details open>
  <summary>Click to learn more about the key features this solution enables</summary>

  - **AI-Powered Document Extraction** <br/>
  Extract structured data from uploaded PDF loan applications and bank statements using GPT-4o with structured outputs.

  - **Automated Loan Decision Making** <br/>
  Calculate Debt-to-Income (DTI) ratios and make loan approval decisions with interest rate determination via MCP tools.

  - **Cross-Document Validation** <br/>
  Validate extracted data across documents for consistency, completeness, and applicant identity matching.

  - **Specialized Agent Orchestration** <br/>
  Uses Microsoft Agent Framework to coordinate Triage, Document Extraction, Validation, Decision Making, and General Chat agents.

  - **Real-Time Streaming Responses** <br/>
  Server-Sent Events (SSE) provide real-time progress updates and streaming responses during document processing.

</details>

<br /><br />
<h2><img src="./docs/images/readme/quick-deploy.png" width="64" />
Quick deploy
</h2>

### How to install or deploy

Follow the quick deploy steps on the deployment guide to deploy this solution to your own Azure subscription.

[Click here to launch the deployment guide](./docs/DEPLOYMENT.md)

<br/>

### Prerequisites and costs

To deploy this solution accelerator, ensure you have access to an [Azure subscription](https://azure.microsoft.com/free/) with the necessary permissions to create **resource groups, resources, and assign roles at the resource group level**. This should include Contributor role at the subscription level and Role Based Access Control role on the subscription and/or resource group level.

**Required tools**:
- Azure CLI 2.80.0+ ([install](https://docs.microsoft.com/cli/azure/install-azure-cli))
- PowerShell 7+ (Windows) or Bash (Linux/macOS)
- Azure OpenAI access ([request here](https://aka.ms/oai/access))

**For local development**:
- Python 3.11+
- Node.js 18+
- Docker (optional)

Check the [Azure Products by Region](https://azure.microsoft.com/en-us/explore/global-infrastructure/products-by-region/?products=all&regions=all) page and select a **region** where the following services are available. Supported regions: `eastus`, `eastus2`, `westus`, `westus2`, `swedencentral`, `northcentralus`.

Pricing varies per region and usage, so it isn't possible to predict exact costs for your usage. Use the [Azure pricing calculator](https://azure.microsoft.com/en-us/pricing/calculator) to calculate the cost of this solution in your subscription.

_Note: This is not meant to outline all costs as selected SKUs, scaled use, customizations, and integrations into your own tenant can affect the total consumption of this sample solution._

<br/>

| Product | Description | Cost |
|---|---|---|
| [Azure OpenAI Service](https://learn.microsoft.com/en-us/azure/ai-services/openai/) | GPT-4o for document extraction and agent orchestration. Pricing is based on token count. | [Pricing](https://azure.microsoft.com/pricing/details/cognitive-services/) |
| [Azure Container Apps](https://learn.microsoft.com/en-us/azure/container-apps/) | Hosts backend API, frontend, and MCP server. Pricing is based on resource consumption. | [Pricing](https://azure.microsoft.com/pricing/details/container-apps/) |
| [Azure Container Registry](https://learn.microsoft.com/en-us/azure/container-registry/) | Basic tier. Build, store, and manage container images. | [Pricing](https://azure.microsoft.com/pricing/details/container-registry/) |
| [Azure Blob Storage](https://learn.microsoft.com/en-us/azure/storage/blobs/) | Standard tier, LRS. Stores uploaded loan documents. | [Pricing](https://azure.microsoft.com/pricing/details/storage/blobs/) |
| [Log Analytics](https://learn.microsoft.com/en-us/azure/azure-monitor/) | Pay-as-you-go tier. Monitoring and diagnostics. | [Pricing](https://azure.microsoft.com/pricing/details/monitor/) |

<br/>

> ⚠️ **Important:** To avoid unnecessary costs, remember to take down your app if it's no longer in use, either by deleting the resource group in the Portal or running the appropriate teardown commands.

<br /><br />
<h2><img src="./docs/images/readme/business-scenario.png" width="64" />
Business Scenario
</h2>

|![Student Loan Process Demo](./media/StudentLoanProcess.gif)|
|---|

<br/>

Streamline student loan processing by leveraging AI to extract document data, validate applications, and make automated approval decisions through natural conversation. The solution helps lending teams reduce processing time by automating document analysis and decision-making while maintaining human oversight.

⚠️ The sample data used in this repository is synthetic. The data is intended for use as sample data only.

<br/>

### Business value
<details>
  <summary>Click to learn more about what value this solution provides</summary>

  - **Automate document processing** <br/>
  Extract structured data from PDF loan applications and bank statements automatically using GPT-4o, eliminating manual data entry.

  - **Accelerate loan decisions** <br/>
  Calculate DTI ratios and determine loan approval with interest rate assignment in seconds rather than days.

  - **Ensure data consistency** <br/>
  Cross-validate applicant data across multiple documents to catch discrepancies before processing.

  - **Natural conversational interface** <br/>
  Enable applicants and loan officers to interact with the system through natural language rather than complex forms.

  - **Secure and responsible AI** <br/>
  Maintain data security with managed identities while fostering responsible AI adoption with human-in-the-loop confirmation steps.

</details>

<br/>

### How to use the solution

Once deployed, follow these steps to process a student loan application:

1. **Greet the Agent** — Open the frontend and start with a greeting. The agent will introduce itself.
2. **Initiate the Application** — Tell the agent you're ready to apply (e.g., "I'd like to apply for a student loan").
3. **Upload Documents** — Upload a Loan Application (LA) and Bank Statement (BS) as PDFs. Sample documents are in [`src/backend/app/upload_data/`](./src/backend/app/upload_data/).
4. **Confirm Upload** — Review the uploaded files and confirm they are ready for processing.
5. **Wait for Extraction** — The agent extracts structured data using GPT-4o (10-30 seconds).
6. **Confirm Extracted Data** — Review the extracted information and confirm to proceed.
7. **Receive Decision** — Get approval status, DTI ratio, interest rate (if approved), and explanation.

<br /><br />

<h2><img src="./docs/images/readme/supporting-documentation.png" width="64" />
Supporting documentation
</h2>

### Architecture details

**3-Tier Multi-Agent System:**

| Tier | Components |
|---|---|
| **Backend** (FastAPI + Agent Framework) | Orchestration Agent, Document Scanner (GPT-4o), Validator Agent, Decision Maker (MCP tools), Chat Agent |
| **Frontend** (React + Vite) | Real-time chat with streaming, PDF upload (drag-and-drop), Workflow status tracking |
| **Business API** (MCP Server) | DTI ratio calculation, Credit profile evaluation, Interest rate determination |

**Multi-Agent Architecture:**

|![Multi-Agent Architecture](./media/architecture.png)|
|---|

### Additional documentation

- [MCP Server Documentation](./src/biz_api/loan_approval/README.md)
- [DTI Calculation Logic](./src/biz_api/loan_approval/DTI_IMPLEMENTATION.md)
- [Frontend Development Guide](./src/frontend/README.md)

### Security guidelines

This template uses [Managed Identity](https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview) for authentication between Azure services.

To ensure continued best practices in your own repository, we recommend that anyone creating solutions based on our templates ensure that the [Github secret scanning](https://docs.github.com/code-security/secret-scanning/about-secret-scanning) setting is enabled.

You may want to consider additional security measures, such as:

* Enabling Microsoft Defender for Cloud to [secure your Azure resources](https://learn.microsoft.com/azure/defender-for-cloud).
* Protecting the Azure Container Apps with [authentication](https://learn.microsoft.com/azure/container-apps/authentication) and/or [Virtual Network integration](https://learn.microsoft.com/azure/container-apps/vnet-custom).

<br/>

### Cross references

Check out similar solution accelerators

| Solution Accelerator | Description |
|---|---|
| [Content&nbsp;generation](https://github.com/microsoft/content-generation-solution-accelerator) | Interpret creative briefs and generate on-brand, multimodal marketing content using a multi-agent system. |
| [Chat&nbsp;with&nbsp;your&nbsp;data](https://github.com/Azure-Samples/chat-with-your-data-solution-accelerator) | Chat with your own data by combining Azure Cognitive Search and Large Language Models (LLMs) to create a conversational search experience. |
| [Document&nbsp;knowledge&nbsp;mining](https://github.com/microsoft/Document-Knowledge-Mining-Solution-Accelerator) | Process and extract summaries, entities, and metadata from unstructured, multi-modal documents. |

<br/>

💡 Want to get familiar with Microsoft's AI and Data Engineering best practices? Check out our playbooks to learn more

| Playbook | Description |
|:---|:---|
| [AI&nbsp;playbook](https://learn.microsoft.com/en-us/ai/playbook/) | The Artificial Intelligence (AI) Playbook provides enterprise software engineers with solutions, capabilities, and code developed to solve real-world AI problems. |
| [Data&nbsp;playbook](https://learn.microsoft.com/en-us/data-engineering/playbook/understanding-data-playbook) | The data playbook provides enterprise software engineers with solutions which contain code developed to solve real-world problems. Everything in the playbook is developed with, and validated by, some of Microsoft's largest and most influential customers and partners. |

<br/>

## Provide feedback

Have questions, find a bug, or want to request a feature? [Submit a new issue](https://github.com/Azure-Samples/multi-agent-student-loan-processing-SA/issues) on this repo and we'll connect.

<br/>

## Responsible AI Transparency FAQ

Please refer to [Transparency FAQ](./docs/TRANSPARENCY_FAQ.md) for responsible AI transparency details of this solution accelerator.

<br/>

## Disclaimers

This release is an artificial intelligence (AI) system that generates text based on user input. The text generated by this system may include ungrounded content, meaning that it is not verified by any reliable source or based on any factual data. The data included in this release is synthetic, meaning that it is artificially created by the system and may contain factual errors or inconsistencies. Users of this release are responsible for determining the accuracy, validity, and suitability of any content generated by the system for their intended purposes. Users should not rely on the system output as a source of truth or as a substitute for human judgment or expertise.

This release only supports English language input and output. Users should not attempt to use the system with any other language or format. The system output may not be compatible with any translation tools or services, and may lose its meaning or coherence if translated.

This release does not reflect the opinions, views, or values of Microsoft Corporation or any of its affiliates, subsidiaries, or partners. The system output is solely based on the system's own logic and algorithms, and does not represent any endorsement, recommendation, or advice from Microsoft or any other entity. Microsoft disclaims any liability or responsibility for any damages, losses, or harms arising from the use of this release or its output by any user or third party.

This release does not provide any financial advice, and is not designed to replace the role of qualified financial advisors in appropriately advising clients. Users should not use the system output for any financial decisions or transactions, and should consult with a professional financial advisor before taking any action based on the system output. Microsoft is not a financial institution or a fiduciary, and does not offer any financial products or services through this release or its output.

This release is intended as a proof of concept only, and is not a finished or polished product. It is not intended for commercial use or distribution, and is subject to change or discontinuation without notice. Any planned deployment of this release or its output should include comprehensive testing and evaluation to ensure it is fit for purpose and meets the user's requirements and expectations. Microsoft does not guarantee the quality, performance, reliability, or availability of this release or its output, and does not provide any warranty or support for it.

This Software requires the use of third-party components which are governed by separate proprietary or open-source licenses as identified below, and you must comply with the terms of each applicable license in order to use the Software. You acknowledge and agree that this license does not grant you a license or other right to use any such third-party proprietary or open-source components.

To the extent that the Software includes components or code used in or derived from Microsoft products or services, including without limitation Microsoft Azure Services (collectively, "Microsoft Products and Services"), you must also comply with the Product Terms applicable to such Microsoft Products and Services. You acknowledge and agree that the license governing the Software does not grant you a license or other right to use Microsoft Products and Services. Nothing in the license or this ReadMe file will serve to supersede, amend, terminate or modify any terms in the Product Terms for any Microsoft Products and Services.

You must also comply with all domestic and international export laws and regulations that apply to the Software, which include restrictions on destinations, end users, and end use. For further information on export restrictions, visit https://aka.ms/exporting.

You acknowledge that the Software and Microsoft Products and Services (1) are not designed, intended or made available as a medical device(s), and (2) are not designed or intended to be a substitute for professional medical advice, diagnosis, treatment, or judgment and should not be used to replace or as a substitute for professional medical advice, diagnosis, treatment, or judgment. Customer is solely responsible for displaying and/or obtaining appropriate consents, warnings, disclaimers, and acknowledgements to end users of Customer's implementation of the Online Services.

You acknowledge the Software is not subject to SOC 1 and SOC 2 compliance audits. No Microsoft technology, nor any of its component technologies, including the Software, is intended or made available as a substitute for the professional advice, opinion, or judgment of a certified financial services professional. Do not use the Software to replace, substitute, or provide professional financial advice or judgment.

BY ACCESSING OR USING THE SOFTWARE, YOU ACKNOWLEDGE THAT THE SOFTWARE IS NOT DESIGNED OR INTENDED TO SUPPORT ANY USE IN WHICH A SERVICE INTERRUPTION, DEFECT, ERROR, OR OTHER FAILURE OF THE SOFTWARE COULD RESULT IN THE DEATH OR SERIOUS BODILY INJURY OF ANY PERSON OR IN PHYSICAL OR ENVIRONMENTAL DAMAGE (COLLECTIVELY, "HIGH-RISK USE"), AND THAT YOU WILL ENSURE THAT, IN THE EVENT OF ANY INTERRUPTION, DEFECT, ERROR, OR OTHER FAILURE OF THE SOFTWARE, THE SAFETY OF PEOPLE, PROPERTY, AND THE ENVIRONMENT ARE NOT REDUCED BELOW A LEVEL THAT IS REASONABLY, APPROPRIATE, AND LEGAL, WHETHER IN GENERAL OR IN A SPECIFIC INDUSTRY. BY ACCESSING THE SOFTWARE, YOU FURTHER ACKNOWLEDGE THAT YOUR HIGH-RISK USE OF THE SOFTWARE IS AT YOUR OWN RISK.
