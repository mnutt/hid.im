class HidimsController < ApplicationController
  def new
    @hidim = Hidim.new
  end
  
  def create
    @hidim = Hidim.create( params[:hidim] )
    redirect_to @hidim
  end

  def show
    @hidim = Hidim.find params[:id]
  end

  def index
    @hidim = Hidim.new

    @hidims = Hidim.featured.find(:all, :limit => 10, :order => "created_at DESC")
  end
end
