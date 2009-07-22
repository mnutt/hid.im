class HidimsController < ApplicationController
  caches_page :index
  
  protect_from_forgery :except => [:create]

  def new
    @hidim = Hidim.new
  end
  
  def create
    @hidim = Hidim.new( params[:hidim] )
    if @hidim.save
      redirect_to hidim_url(@hidim.token)
    else
      flash[:notice] = @hidim.errors[:torrent]
      redirect_to "/"
    end
  end

  def show
    @hidim = Hidim.find_by_token(params[:id]) or raise ActiveRecord::RecordNotFound
  end

  def index
    @hidim = Hidim.new

    @hidims = Hidim.featured.find(:all, :limit => 10, :order => "created_at DESC")
  end
end
