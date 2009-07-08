class HidimsController < ApplicationController
  def new
    @hidim = Hidim.new
  end
  
  def create
    @hidim = Hidim.new( params[:hidim] )
    if @hidim.save
      redirect_to @hidim
    else
      flash[:notice] = @hidim.errors[:torrent]
      redirect_to "/"
    end
  end

  def show
    @hidim = Hidim.find params[:id]
  end

  def index
    @hidim = Hidim.new

    @hidims = Hidim.featured.find(:all, :limit => 10, :order => "created_at DESC")
  end
end
