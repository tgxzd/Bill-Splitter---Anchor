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

        let bill = &mut ctx.accounts.bill;
        bill.creator = ctx.accounts.creator.key();
        bill.name = name;
        bill.total_amount = total_amount;
        bill.participant_name = participant_name;
        bill.created_at = Clock::get()?.unix_timestamp;
        bill.is_paid = false;  // Initialize as unpaid

        msg!("Bill created successfully");
        Ok(())
    }

    pub fn pay_bill(ctx: Context<PayBill>) -> Result<()> {
        msg!("Processing payment for bill");
        msg!("Payer balance: {}", ctx.accounts.payer.lamports());

        let bill = &mut ctx.accounts.bill;
        require!(!bill.is_paid, BillError::AlreadyPaid);

        // Transfer the payment
        let transfer_ix = system_program::Transfer {
            from: ctx.accounts.payer.to_account_info(),
            to: ctx.accounts.bill.to_account_info(),
        };

        let cpi_context = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            transfer_ix,
        );

        system_program::transfer(cpi_context, bill.total_amount)?;
        
        bill.is_paid = true;
        msg!("Payment complete. New bill balance: {}", ctx.accounts.bill.to_account_info().lamports());
        msg!("New payer balance: {}", ctx.accounts.payer.lamports());

        Ok(())
    }

    pub fn delete_bill(ctx: Context<DeleteBill>) -> Result<()> {
        msg!("Deleting bill account");
        
        let bill_balance = ctx.accounts.bill.to_account_info().lamports();
        msg!("Bill balance to reclaim: {}", bill_balance);

        // Transfer the remaining lamports back to the creator
        **ctx.accounts.bill.to_account_info().try_borrow_mut_lamports()? = 0;
        **ctx.accounts.creator.try_borrow_mut_lamports()? += bill_balance;

        msg!("Funds reclaimed. New creator balance: {}", ctx.accounts.creator.lamports());
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
    #[account(
        init,
        payer = creator,
        space = Bill::space(&name, &participant_name),
        seeds = [b"bill", creator.key().as_ref(), name.as_bytes()],
        bump
    )]
    pub bill: Account<'info, Bill>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct PayBill<'info> {
    #[account(
        mut,
        constraint = !bill.is_paid @ BillError::AlreadyPaid
    )]
    pub bill: Account<'info, Bill>,
    
    #[account(
        mut,
        constraint = payer.lamports() >= bill.total_amount @ BillError::InsufficientFunds
    )]
    pub payer: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeleteBill<'info> {
    #[account(
        mut,
        close = creator,
        constraint = bill.creator == creator.key() @ BillError::UnauthorizedDeletion
    )]
    pub bill: Account<'info, Bill>,
    
    #[account(mut)]
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
    pub is_paid: bool,  // New field to track payment status
}

impl Bill {
    fn space(name: &str, participant_name: &str) -> usize {
        8 +  // discriminator
        32 + // creator pubkey
        4 + name.len() + // name string
        8 + // total_amount
        4 + participant_name.len() + // participant_name string
        8 + // created_at
        1 + // is_paid boolean
        200 // padding for safety
    }
}

#[error_code]
pub enum BillError {
    #[msg("Insufficient funds for bill payment")]
    InsufficientFunds,
    #[msg("Only the creator can delete this bill")]
    UnauthorizedDeletion,
    #[msg("This bill has already been paid")]
    AlreadyPaid,
}
