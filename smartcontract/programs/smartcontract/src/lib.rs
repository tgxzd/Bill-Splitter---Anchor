use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("GQkaiF2ajZcHkdxbPyDnpBpjscWrs4xAcpinETPDAqDt");

#[program]
pub mod smartcontract {
    use super::*;

    pub fn create_bill(
        ctx: Context<CreateBill>,
        name: String,
        total_amount: u64,
        participants: Vec<Pubkey>,
        shares: Vec<u64>,
        participant_name: String,
    ) -> Result<()> {
        msg!("Creating bill with amount: {}", total_amount);
        msg!("Creator balance: {}", ctx.accounts.creator.lamports());

        let bill = &mut ctx.accounts.bill;
        bill.creator = ctx.accounts.creator.key();
        bill.name = name;
        bill.total_amount = total_amount;
        bill.participant_name = participant_name;
        bill.created_at = Clock::get()?.unix_timestamp;

        msg!("Transferring {} lamports to bill account", total_amount);
        
        // Transfer the payment from creator to the bill account
        let transfer_ix = system_program::Transfer {
            from: ctx.accounts.creator.to_account_info(),
            to: ctx.accounts.bill.to_account_info(),
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_ix,
        );

        system_program::transfer(cpi_context, total_amount)?;
        
        msg!("Transfer complete. New bill balance: {}", ctx.accounts.bill.to_account_info().lamports());
        msg!("New creator balance: {}", ctx.accounts.creator.lamports());

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(
    name: String,
    total_amount: u64,
    participants: Vec<Pubkey>,
    shares: Vec<u64>,
    participant_name: String
)]
pub struct CreateBill<'info> {
    /// CHECK: PDA account that will hold the bill data and SOL
    #[account(
        init,
        payer = creator,
        space = Bill::space(&name, &participant_name),
        seeds = [b"bill", creator.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub bill: Account<'info, Bill>,
    
    #[account(
        mut,
        constraint = creator.lamports() >= total_amount @ BillError::InsufficientFunds
    )]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Bill {
    pub creator: Pubkey,
    pub name: String,
    pub total_amount: u64,
    pub participant_name: String,
    pub created_at: i64,
}

impl Bill {
    fn space(name: &str, participant_name: &str) -> usize {
        8 +  // discriminator
        32 + // creator pubkey
        4 + name.len() + // name string
        8 + // total_amount
        4 + participant_name.len() + // participant_name string
        8 + // created_at
        200 // padding for safety
    }
}

#[error_code]
pub enum BillError {
    #[msg("Insufficient funds for bill creation")]
    InsufficientFunds,
}
